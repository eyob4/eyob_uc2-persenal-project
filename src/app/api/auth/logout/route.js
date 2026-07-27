import { successResponse } from "@/lib/utils";
import { AUTH_COOKIE } from "@/lib/jwt";

export async function POST() {
  const res = successResponse(null, "Logged out");
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}
