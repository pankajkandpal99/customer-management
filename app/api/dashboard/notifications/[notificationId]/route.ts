/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyAuth } from "@/app/lib/auth";
import { elasticClient } from "@/lib/elasticsearch";
import { pusher } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const markAsReadSchema = z.object({
  read: z.boolean(),
});

export const PUT = async (
  req: NextRequest,
  { params }: { params: { notificationId: string } }
) => {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await params;
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = markAsReadSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error.errors },
        { status: 400 }
      );
    }

    const exists = await elasticClient.exists({
      index: "notifications",
      id: notificationId,
    });

    if (!exists) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await elasticClient.update({
      index: "notifications",
      id: notificationId,
      body: {
        doc: { read: validatedData.data.read },
      },
    });

    // Notify Pusher to update unread count
    await pusher.trigger("notifications", "notification-updated", {
      id: notificationId,
      read: true,
    });

    return NextResponse.json({
      message: "Notification marked as read",
      notificationId,
    });
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
};
