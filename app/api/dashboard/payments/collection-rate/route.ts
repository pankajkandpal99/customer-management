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

    const paidResponse: any = await elasticClient.search({
      index: "payments",
      body: {
        query: { match: { status: "Paid" } },
        size: 10000,
      },
    });

    const allResponse: any = await elasticClient.search({
      index: "payments",
      body: {
        query: { match_all: {} },
        size: 10000,
      },
    });

    const paidAmount = paidResponse.hits?.hits?.reduce(
      (sum: number, hit: any) =>
        sum + ((hit._source as { amount: number })?.amount || 0),
      0
    );

    const totalAmount = allResponse.hits?.hits?.reduce(
      (sum: number, hit: any) =>
        sum + ((hit._source as { amount: number })?.amount || 0),
      0
    );

    const collectionRate =
      totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(2) : 0;

    return NextResponse.json({ collectionRate }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching collection rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection rate" },
      { status: 500 }
    );
  }
};
