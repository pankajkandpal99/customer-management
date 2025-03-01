/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyAuth } from "@/app/lib/auth";
import { customerSchema, notificationSchema } from "@/app/lib/zodSchema";
import { elasticClient } from "@/lib/elasticsearch";
import { pusher } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";
import * as xlsx from "xlsx";

export const POST = async (req: NextRequest) => {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Validate each row using Zod schema
    const validatedData = data.map((row, index) => {
      try {
        return customerSchema.parse(row);
      } catch (error) {
        console.error(`Validation error in row ${index + 1}:`, error);
        throw new Error(`Invalid data in row ${index + 1}`);
      }
    });

    const index = "customers";
    const indexExists = await elasticClient.indices.exists({ index });
    if (!indexExists) {
      await elasticClient.indices.create({ index });
    }

    const savedCustomers = await Promise.all(
      validatedData.map(async (customer) => {
        const response = await elasticClient.index({
          index,
          document: {
            ...customer,
            createdAt: new Date().toISOString(),
          },
        });

        const customerId = response._id;
        const notificationData = {
          type: "NEW_CUSTOMER",
          message: `New customer ${customer.name} added`,
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

        const notificationId = notificationResponse._id;

        await pusher.trigger("notifications", "new-notification", {
          id: notificationId,
          ...parsedNotification,
        });

        return { id: customerId, ...customer };
      })
    );

    // console.log("saved customer : ", savedCustomers);

    return NextResponse.json(
      { message: "Bulk upload successful", data: savedCustomers },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error processing bulk upload:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bulk upload" },
      { status: 500 }
    );
  }
};
