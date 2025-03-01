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

    const response = await elasticClient.search({
      index: "payments",
      body: {
        query: { match_all: {} },
        sort: [{ createdAt: { order: "desc" } }],
        size: 5,
      },
    });

    // const response = await elasticClient.search({
    //   index: "payments",
    //   body: {
    //     query: { match_all: {} },
    //     size: 1,
    //   },
    // });
    // console.log("Sample payment data:", response.hits.hits[0]?._source);

    if (!response.hits.hits.length) {
      console.error("No recent payments found.");
      return NextResponse.json({ payments: [] }, { status: 200 });
    }

    const payments = response.hits.hits.map((hit: any) => ({
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
