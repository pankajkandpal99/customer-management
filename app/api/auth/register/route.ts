import { RegisterSchema } from "@/app/lib/zodSchema";
import { elasticClient } from "@/lib/elasticsearch";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = RegisterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { username, email, password } = validationResult.data;
    const userId = uuidv4(); // Generate unique ID
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    await elasticClient.index({
      index: "users",
      id: userId,
      document: {
        username,
        email,
        password: hashedPassword,
        createdAt,
        updatedAt,
      },
    });

    // console.log("User registered successfully: ");

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
