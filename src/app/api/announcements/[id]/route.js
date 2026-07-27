import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Announcement from "@/models/Announcement";

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  await connectToDatabase();
  const deleted = await Announcement.findByIdAndDelete(id);
  if (!deleted) {
    return errorResponse("Announcement not found", 404);
  }
  return successResponse(null, "Announcement removed");
}
