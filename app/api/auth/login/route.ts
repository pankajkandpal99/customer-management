import { loginSchema } from "@/app/lib/zodSchema";
import { elasticClient } from "@/lib/elasticsearch";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface User {
  id: string;
  email: string;
  password: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const validationResult = loginSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validationResult.error.errors },
      { status: 400 }
    );
  }

  const { email, password } = validationResult.data;

  try {
    const searchResponse = await elasticClient.search({
      index: "users",
      body: {
        query: {
          match: { email },
        },
      },
    });

    // Use searchResponse.body.hits.hits instead of searchResponse.hits.hits
    if (!searchResponse.body.hits.hits.length) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const userId = searchResponse.body.hits.hits[0]._id;
    const user = searchResponse.body.hits.hits[0]._source as User;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId, email: user.email },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
