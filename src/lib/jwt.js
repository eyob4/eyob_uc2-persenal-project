import jwt from "jsonwebtoken";

export const AUTH_COOKIE = "sms_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, seconds

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}
