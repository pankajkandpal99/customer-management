/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyAuth } from "@/app/lib/auth";
import { customerSchema } from "@/app/lib/zodSchema";
import { elasticClient } from "@/lib/elasticsearch";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;
    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const index = "customers";

    const response = await elasticClient
      .get({ index, id: customerId })
      .catch(() => null);

    if (!response || !response.found) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Customer retrieved successfully",
        customer: response._source,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching customer details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve customer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;
    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsedData = customerSchema.partial().parse(body);

    const index = "customers";

    const existingCustomer = await elasticClient
      .get({ index, id: customerId })
      .catch(() => null);

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    await elasticClient.update({
      index,
      id: customerId,
      body: { doc: parsedData },
      refresh: true,
    });

    const updatedCustomer = await elasticClient.get({
      index,
      id: customerId,
    });

    // console.log("Updated Customer:", updatedCustomer);

    return NextResponse.json(
      {
        message: "Customer updated successfully",
        customer: updatedCustomer._source,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update customer" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;
    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const index = "customers";
    const existingCustomer = await elasticClient
      .get({ index, id: customerId })
      .catch(() => null);

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    await elasticClient.delete({
      index,
      id: customerId,
    });

    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete customer" },
      { status: 400 }
    );
  }
}
