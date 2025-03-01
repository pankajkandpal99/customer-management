"use server";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const verifyAuth = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("jwt")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
      userId: string;
      email?: string;
      iat?: number;
      exp?: number;
    };

    return { userId: decoded.userId };
  } catch (error) {
    console.error("Invalid JWT:", error);
    return null;
  }
};
