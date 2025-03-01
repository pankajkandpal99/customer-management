/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyAuth } from "@/app/lib/auth";
import { notificationSchema } from "@/app/lib/zodSchema";
import { elasticClient } from "@/lib/elasticsearch";
import { pusher } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

interface Payment {
  id: string;
  customer: string;
  customerId: string;
  amount: number;
  date: string;
  status: string;
}

export const PUT = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { paymentId: string };
  }
) => {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await params;
    const { status } = await req.json();

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "Payment ID and status are required" },
        { status: 400 }
      );
    }

    const paymentExists = await elasticClient.exists({
      index: "payments",
      id: paymentId,
    });

    if (!paymentExists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    await elasticClient.update({
      index: "payments",
      id: paymentId,
      body: {
        doc: { status },
      },
    });

    const updatedPayment = await elasticClient.get({
      index: "payments",
      id: paymentId,
    });

    const updatedPaymentData: Payment = {
      id: updatedPayment._id,
      customer: (updatedPayment._source as any).customer,
      customerId: (updatedPayment._source as any).customerId,
      amount: (updatedPayment._source as any).amount,
      date: (updatedPayment._source as any).date,
      status: (updatedPayment._source as any).status,
    };

    // console.log("updated Payment :", updatedPaymentData);
    // console.log("status: ", status);

    const notificationType =
      status === "Paid" ? "PAYMENT_RECEIVED" : "PAYMENT_UPDATED";

    const notificationMessage =
      status === "Paid"
        ? `Payment of ₹${updatedPaymentData.amount} has been received from ${updatedPaymentData.customer}.`
        : `Payment status updated to ${status} for ₹${updatedPaymentData.amount}.`;

    const notificationData = {
      type: notificationType,
      message: notificationMessage,
      paymentId,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const parsedNotification = notificationSchema.parse(notificationData);

    // Save Notification in Elasticsearch
    const response = await elasticClient.index({
      index: "notifications",
      document: parsedNotification,
    });

    const notificationId = response._id;

    // Send Real-Time Notification via Pusher
    await pusher.trigger("notifications", "new-notification", {
      id: notificationId,
      ...parsedNotification,
    });

    await pusher.trigger(
      "dashboard-updates",
      "payment-updated",
      updatedPaymentData
    );

    return NextResponse.json(
      {
        message: "Payment status updated successfully",
        payment: updatedPaymentData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment status" },
      { status: 500 }
    );
  }
};
