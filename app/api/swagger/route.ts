/* eslint-disable @typescript-eslint/no-explicit-any */
import swaggerJsdoc from "swagger-jsdoc";
import { NextResponse } from "next/server";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini Collection Management System API",
      version: "1.0.0",
      description:
        "API documentation for the Mini Collection Management System",
    },
    servers: [
      {
        url: `${process.env.NEXT_PUBLIC_URL}/api`,
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Customer: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The auto-generated ID of the customer",
            },
            name: {
              type: "string",
              description: "The name of the customer",
            },
            phoneNumber: {
              type: "string",
              description: "The phone number of the customer",
            },
            email: {
              type: "string",
              description: "The email address of the customer",
            },
            outstandingPayment: {
              type: "number",
              description: "The outstanding payment amount",
            },
            paymentDueDate: {
              type: "string",
              format: "date",
              description: "The due date for the payment",
            },
            paymentStatus: {
              type: "string",
              enum: ["Paid", "Pending"],
              description: "The status of the payment",
            },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The auto-generated ID of the payment",
            },
            customerId: {
              type: "string",
              description: "The ID of the customer",
            },
            amount: {
              type: "number",
              description: "The amount of the payment",
            },
            date: {
              type: "string",
              format: "date",
              description: "The date of the payment",
            },
            status: {
              type: "string",
              enum: ["Paid", "Pending"],
              description: "The status of the payment",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./app/api/**/*.ts"],
};

export async function GET() {
  const swaggerSpec = swaggerJsdoc(options);
  return NextResponse.json(swaggerSpec);
}
