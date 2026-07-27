import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Announcement from "@/models/Announcement";

const ROLE_AUDIENCE = { teacher: "teachers", student: "students", parent: "parents" };

export async function GET(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, []);
  if (denied) return denied;

  await connectToDatabase();

  const query = user.role === "admin" ? {} : { targetRole: { $in: ["all", ROLE_AUDIENCE[user.role]] } };
  const announcements = await Announcement.find(query).populate("createdBy", "name").sort({ createdAt: -1 });
  return successResponse(announcements);
}

export async function POST(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { title, message, targetRole } = body;
  if (!title || !message) {
    return errorResponse("Title and message are required", 400);
  }

  await connectToDatabase();
  const created = await Announcement.create({ title, message, targetRole: targetRole || "all", createdBy: user._id });
  await created.populate("createdBy", "name");
  return successResponse(created, "Announcement posted", { status: 201 });
}
