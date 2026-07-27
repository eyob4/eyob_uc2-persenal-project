import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Parent from "@/models/Parent";

export async function GET(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin", "parent"]);
  if (denied) return denied;

  await connectToDatabase();

  if (user.role === "admin") {
    const parents = await Parent.find()
      .populate("userId", "name email")
      .populate({ path: "children", populate: [{ path: "userId", select: "name email" }, { path: "classId" }] });
    return successResponse(parents);
  }

  const own = await Parent.findOne({ userId: user._id }).populate({
    path: "children",
    populate: [{ path: "userId", select: "name email" }, { path: "classId" }],
  });
  if (!own) {
    return errorResponse("Parent profile not found", 404);
  }
  return successResponse(own);
}
