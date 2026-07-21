import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/db";

const secret = process.env.JWT_SECRET || "sms-secret";

export async function getAuthenticatedUser(request, allowedRoles = []) {
  await connectToDatabase();

  const header = request.headers.get("authorization");
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return {
      error: NextResponse.json({ message: "Unauthorized: token missing" }, { status: 401 }),
    };
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return {
        error: NextResponse.json({ message: "Unauthorized: invalid user" }, { status: 401 }),
      };
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        error: NextResponse.json({ message: "Forbidden: insufficient role" }, { status: 403 }),
      };
    }

    return { user };
  } catch {
    return {
      error: NextResponse.json({ message: "Unauthorized: invalid token" }, { status: 401 }),
    };
  }
}
