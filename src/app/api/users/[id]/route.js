import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import User from "@/models/User";

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { name, isActive } = body;

  await connectToDatabase();
  const updated = await User.findByIdAndUpdate(id, { name, isActive }, { new: true }).select("-password");
  if (!updated) {
    return errorResponse("User not found", 404);
  }
  return successResponse(updated, "User updated");
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;

  await connectToDatabase();
  const deactivated = await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select("-password");
  if (!deactivated) {
    return errorResponse("User not found", 404);
  }
  return successResponse(deactivated, "User deactivated");
}
