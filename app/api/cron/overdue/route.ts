import { elasticClient } from "@/lib/elasticsearch";
import { pusher } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { hits } = await elasticClient.search({
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

    const overduePayments = hits.hits.map((hit) => ({
      id: hit._id,
      amount: (hit._source as { amount: number }).amount,
      customer: (hit._source as { customer: string }).customer,
      dueDate: (hit._source as { dueDate: string }).dueDate,
    }));

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
