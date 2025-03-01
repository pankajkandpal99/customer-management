/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyAuth } from "@/app/lib/auth";
import { notificationSchema, paymentSchema } from "@/app/lib/zodSchema";
import { elasticClient } from "@/lib/elasticsearch";
import { pusher } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    // if (!customerId) {
    //   return NextResponse.json(
    //     { error: "Customer ID is required" },
    //     { status: 400 }
    //   );
    // }

    const query = customerId ? { match: { customerId } } : { match_all: {} };
    const response = await elasticClient.search({
      index: "payments",
      body: {
        query,
        size: 1000,
      },
    });

    // console.log("response : ", response);

    const payments = response.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }));

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const parsedPayment = {
      ...paymentSchema.parse(body),
      createdAt: new Date().toISOString(),
    };

    const index = "payments";
    const indexExists = await elasticClient.indices.exists({ index });
    if (!indexExists) {
      await elasticClient.indices.create({ index });
    }

    const response = await elasticClient.index({
      index,
      document: parsedPayment,
    });

    const paymentId = response._id;

    const savedPayment = await elasticClient.get({
      index: "payments",
      id: paymentId,
    });

    const fullPaymentData = {
      id: paymentId,
      ...(savedPayment._source || {}),
    };

    const notificationType =
      parsedPayment.status === "Paid" ? "PAYMENT_RECEIVED" : "PAYMENT_CREATED";

    const notificationMessage =
      parsedPayment.status === "Paid"
        ? `Payment of ₹${parsedPayment.amount} has been received from ${parsedPayment.customer}.`
        : `Payment of ₹${parsedPayment.amount} created from ${parsedPayment.customer}.`;

    // Create Notification for Payment Received
    const notificationData = {
      type: notificationType,
      message: notificationMessage,
      paymentId,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const parsedNotification = notificationSchema.parse(notificationData);

    // Save Notification in Elasticsearch
    const notificationResponse = await elasticClient.index({
      index: "notifications",
      document: parsedNotification,
    });

    const notificationId = notificationResponse._id;

    // Send real-time notification via Pusher
    await pusher.trigger("notifications", "new-notification", {
      id: notificationId,
      ...parsedNotification,
    });

    // **Send Real-Time Dashboard Update via Pusher**
    await pusher.trigger("dashboard-updates", "new-payment", fullPaymentData);

    return NextResponse.json(fullPaymentData, { status: 201 });
  } catch (error: any) {
    console.error("Error adding payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add payment" },
      { status: 400 }
    );
  }
};
