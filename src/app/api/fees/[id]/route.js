import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Fee from "@/models/Fee";

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { amount, dueDate, status, paymentDate, receiptNo } = body;

  await connectToDatabase();
  const updated = await Fee.findByIdAndUpdate(
    id,
    { amount, dueDate, status, paymentDate, receiptNo },
    { new: true }
  );
  if (!updated) {
    return errorResponse("Fee not found", 404);
  }
  return successResponse(updated, "Fee updated");
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  await connectToDatabase();
  const deleted = await Fee.findByIdAndDelete(id);
  if (!deleted) {
    return errorResponse("Fee not found", 404);
  }
  return successResponse(null, "Fee removed");
}
