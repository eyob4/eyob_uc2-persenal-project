import { errorResponse } from "@/lib/utils";

export function requireRole(user, allowedRoles = []) {
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return errorResponse("Forbidden", 403);
  }
  return null;
}

export function isSelf(user, otherUserId) {
  return user._id.toString() === otherUserId?.toString();
}

export function ownsChild(parentDoc, studentId) {
  return Boolean(parentDoc?.children?.some((child) => child.toString() === studentId?.toString()));
}
