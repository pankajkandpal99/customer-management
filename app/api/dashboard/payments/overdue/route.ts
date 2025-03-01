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

    const { body: { hits } } = await elasticClient.search({
      index: "payments",
      body: {
        query: {
          bool: {
            must: [
              { range: { date: { lt: "now/d" } } }, 
              { match: { status: "Pending" } },
            ],
          },
        },
      },
    });

    const overdueAmount = hits.hits.reduce(
      (sum: number, hit: any) => sum + ((hit._source as { amount: number }).amount || 0),
      0
    );

    return NextResponse.json({ overdueAmount }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching overdue payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch overdue payments" },
      { status: 500 }
    );
  }
};
