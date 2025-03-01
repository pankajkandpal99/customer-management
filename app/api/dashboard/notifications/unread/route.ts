/* eslint-disable @typescript-eslint/no-explicit-any */
import { elasticClient } from "@/lib/elasticsearch";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const response = await elasticClient.count({
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
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
};
