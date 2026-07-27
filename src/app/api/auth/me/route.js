import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }
  return successResponse({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  });
}
