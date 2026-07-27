import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/utils";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { email } = body;

  if (!email) {
    return errorResponse("Email is required", 400);
  }

  await connectToDatabase();
  const user = await User.findOne({ email });

  // Always respond the same way whether or not the email is registered, to avoid leaking which emails exist.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });

    const origin = request.nextUrl.origin;
    console.log(`[password reset] ${email} -> ${origin}/reset-password?token=${rawToken}`);
  }

  return successResponse(null, "If that email is registered, a reset link has been sent.");
}
