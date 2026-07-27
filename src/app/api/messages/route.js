import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Message from "@/models/Message";

export async function GET(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, []);
  if (denied) return denied;

  const withUserId = request.nextUrl.searchParams.get("with");
  await connectToDatabase();

  const query = withUserId
    ? {
        $or: [
          { senderId: user._id, receiverId: withUserId },
          { senderId: withUserId, receiverId: user._id },
        ],
      }
    : { $or: [{ senderId: user._id }, { receiverId: user._id }] };

  if (withUserId) {
    await Message.updateMany({ senderId: withUserId, receiverId: user._id, read: false }, { read: true });
  }

  const messages = await Message.find(query)
    .populate("senderId", "name role")
    .populate("receiverId", "name role")
    .sort({ createdAt: 1 });

  return successResponse(messages);
}

export async function POST(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, []);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { receiverId, content } = body;
  if (!receiverId || !content) {
    return errorResponse("receiverId and content are required", 400);
  }

  await connectToDatabase();
  const created = await Message.create({ senderId: user._id, receiverId, content });
  await created.populate("senderId", "name role");
  await created.populate("receiverId", "name role");

  return successResponse(created, "Message sent", { status: 201 });
}
