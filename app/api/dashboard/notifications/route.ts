/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { elasticClient } from "@/lib/elasticsearch";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hits } = await elasticClient.search({
      index: "notifications",
      size: 100,
      query: { match_all: {} },
      sort: [{ timestamp: { order: "desc" } }],
    });

    const notifications = hits.hits.map((hit) => ({
      id: hit._id,
      ...(typeof hit._source === "object" ? hit._source : {}),
    }));

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
