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

    const response = await elasticClient.count({ index: "customers" });

    return NextResponse.json(
      { totalCustomers: response.body.count },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching customer count:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer count" },
      { status: 500 }
    );
  }
};
