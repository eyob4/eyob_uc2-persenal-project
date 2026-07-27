import { connectToDatabase } from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/utils";
import { createRoleProfile } from "@/lib/profiles";
import User from "@/models/User";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { name, email, password, role = "student" } = body;

  if (!name || !email || !password) {
    return errorResponse("Missing required fields", 400);
  }

  await connectToDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    return errorResponse("Email already registered", 400);
  }

  const user = await User.create({ name, email, password, role });
  await createRoleProfile(role, user._id);

  return successResponse(
    { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    "User registered",
    { status: 201 }
  );
}
