/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { elasticClient } from "@/lib/elasticsearch";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const response = await elasticClient.get({
      index: "users",
      id,
    });

    return NextResponse.json(response.body._source);
  } catch (error: any) {
    if (error.meta?.body?.found === false) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Error fetching user by ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const response = await elasticClient.search({
      index: "users",
      body: {
        query: {
          match: { email },
        },
      },
    });

    if (response.body.hits.hits.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = response.body.hits.hits[0]._source;
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
