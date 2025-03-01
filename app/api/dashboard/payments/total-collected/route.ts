/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyAuth } from "@/app/lib/auth";
import { elasticClient } from "@/lib/elasticsearch";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hits } = await elasticClient.search({
      index: "payments",
      body: {
        query: { match: { status: "Paid" } },
        size: 10000,
      },
    });

    const totalCollected = hits.hits.reduce(
      (sum, hit) => sum + ((hit._source as { amount: number }).amount || 0),
      0
    );

    return NextResponse.json({ totalCollected }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching total collected payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch total collected payments" },
      { status: 500 }
    );
  }
};
