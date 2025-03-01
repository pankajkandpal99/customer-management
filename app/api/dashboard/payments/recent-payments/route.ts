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

    const response = await elasticClient.search<{
      hits: {
        hits: {
          _id: string;
          _source: {
            customer: string;
            amount: number;
            createdAt: string;
            status: string;
          };
        }[];
      };
    }>({
      index: "payments",
      body: {
        query: { match_all: {} },
        sort: [{ createdAt: { order: "desc" } }],
        size: 5,
      },
    });

    if (!response.body.hits.hits.length) {
      console.error("No recent payments found.");
      return NextResponse.json({ payments: [] }, { status: 200 });
    }

    const payments = response.body.hits.hits.map((hit) => ({
      id: hit._id,
      customer: hit._source.customer,
      amount: `₹${hit._source.amount}`,
      date: new Date(hit._source.createdAt).toLocaleDateString(),
      status: hit._source.status === "Paid" ? "Paid" : "Pending",
    }));

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
};
