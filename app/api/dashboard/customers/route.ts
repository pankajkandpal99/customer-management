/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { customerSchema, notificationSchema } from "@/app/lib/zodSchema";
import { verifyAuth } from "@/app/lib/auth";
import { elasticClient } from "@/lib/elasticsearch";
import { pusher } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedCustomer = {
      ...customerSchema.parse(body),
      createdAt: new Date().toISOString(),
    };

    const index = "customers";

    const indexExists = await elasticClient.indices.exists({ index });
    if (!indexExists) {
      await elasticClient.indices.create({ index });
    }

    const response = await elasticClient.index({
      index,
      document: parsedCustomer,
    });

    const customerId = response._id;

    // Create Notification Object
    const notificationData = {
      type: "NEW_CUSTOMER",
      message: `New customer ${parsedCustomer.name} added`,
      customerId,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const parsedNotification = notificationSchema.parse(notificationData);

    // Insert Notification into Elasticsearch
    const notificationResponse = await elasticClient.index({
      index: "notifications",
      document: parsedNotification,
    });

    // console.log("notification res : ", notificationResponse);

    const notificationId = notificationResponse._id;

    // Send realtime notification from pusher
    await pusher.trigger("notifications", "new-notification", {
      id: notificationId,
      ...parsedNotification,
    });

    return NextResponse.json(
      { id: customerId, ...parsedCustomer },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding customer:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const index = "customers";

    const { hits } = await elasticClient.search({
      index,
      size: 1000,
      query: { match_all: {} },
    });

    const customers = hits.hits.map((hit) => ({
      id: hit._id,
      ...(typeof hit._source === "object" ? hit._source : {}),
    }));

    // console.log("customers : ", customers);

    return NextResponse.json(customers, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
