import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/utils";
import { signToken, AUTH_COOKIE, COOKIE_MAX_AGE } from "@/lib/jwt";
import { ensureDemoUsers } from "@/lib/seed";
import User from "@/models/User";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse("Missing credentials", 400);
  }

  await ensureDemoUsers();
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user || user.isActive === false) {
    return errorResponse("Invalid credentials", 400);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return errorResponse("Invalid credentials", 400);
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });

  const res = successResponse(
    { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    "Logged in"
  );

  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return res;
}
