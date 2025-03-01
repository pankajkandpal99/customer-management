/* eslint-disable @typescript-eslint/no-explicit-any */
import { elasticClient } from "@/lib/elasticsearch";
import { pusher } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await elasticClient.search({
      index: "payments",
      body: {
        query: {
          bool: {
            must: [
              { range: { dueDate: { lt: "now/d" } } }, // Past due date
              { match: { status: "pending" } }, // Payment still pending
            ],
          },
        },
      },
    });

    const overduePayments = response.body.hits.hits.map(
      (hit: {
        _id: any;
        _source: { amount: any; customer: any; dueDate: any };
      }) => ({
        id: hit._id,
        amount: hit._source.amount,
        customer: hit._source.customer,
        dueDate: hit._source.dueDate,
      })
    );

    if (overduePayments.length === 0) {
      console.log("No overdue payments found.");
      return NextResponse.json({
        success: true,
        message: "No overdue payments.",
      });
    }

    for (const payment of overduePayments) {
      const notificationMessage = `Payment of ₹${payment.amount} from ${payment.customer} is overdue!`;

      await pusher.trigger("notifications", "new-notification", {
        type: "PAYMENT_OVERDUE",
        message: notificationMessage,
        paymentId: payment.id,
        timestamp: new Date().toISOString(),
        read: false,
      });

      console.log(`Sent overdue notification for ${payment.customer}`);
    }

    return NextResponse.json({ success: true, count: overduePayments.length });
  } catch (error) {
    console.error("Error checking overdue payments:", error);
    return NextResponse.json(
      { error: "Failed to check overdue payments" },
      { status: 500 }
    );
  }
}
