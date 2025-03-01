/* eslint-disable @typescript-eslint/no-explicit-any */
import { elasticClient } from "@/lib/elasticsearch";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const { body: indexExists } = await elasticClient.indices.exists({
      index: "notifications",
    });

    if (!indexExists) {
      console.error('Index "notifications" does not exist.');
      return NextResponse.json(
        { error: "Notifications index does not exist" },
        { status: 500 }
      );
    }

    const { body: response } = await elasticClient.count({
      index: "notifications",
      body: {
        query: {
          bool: {
            must: [{ match: { read: false } }],
          },
        },
      },
    });

    return NextResponse.json({ unreadCount: response.count });
  } catch (error: any) {
    console.error("Error fetching unread count 2:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count 1" },
      { status: 500 }
    );
  }
};
