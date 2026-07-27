import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/utils";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { token, password } = body;

  if (!token || !password) {
    return errorResponse("Missing token or new password", 400);
  }

  await connectToDatabase();

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await PasswordResetToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
  if (!resetToken) {
    return errorResponse("Invalid or expired reset token", 400);
  }

  const user = await User.findById(resetToken.user);
  if (!user) {
    return errorResponse("Invalid or expired reset token", 400);
  }

  user.password = password;
  await user.save();

  await PasswordResetToken.deleteMany({ user: user._id });

  return successResponse(null, "Password updated. You can now log in.");
}
