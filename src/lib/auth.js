import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

/**
 * Resolves the authenticated user from the JWT cookie.
 * Pass the NextRequest inside a Route Handler; call with no args inside a
 * Server Component/layout, where cookies() must be read from next/headers instead.
 */
export async function getAuthUser(request) {
  const tokenValue = request?.cookies
    ? request.cookies.get(AUTH_COOKIE)?.value
    : (await cookies()).get(AUTH_COOKIE)?.value;

  if (!tokenValue) {
    return null;
  }

  const payload = verifyToken(tokenValue);
  if (!payload?.userId) {
    return null;
  }

  await connectToDatabase();
  const user = await User.findById(payload.userId).select("-password");
  if (!user || user.isActive === false) {
    return null;
  }

  return user;
}
