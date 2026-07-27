import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Student from "@/models/Student";
import Parent from "@/models/Parent";

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { rollNumber, classId, parentId, dateOfBirth, gender, address, admissionDate } = body;

  await connectToDatabase();

  const existing = await Student.findById(id);
  if (!existing) {
    return errorResponse("Student not found", 404);
  }

  const oldParentId = existing.parentId?.toString();
  const newParentId = parentId || undefined;

  if (oldParentId !== newParentId) {
    if (oldParentId) {
      await Parent.findByIdAndUpdate(oldParentId, { $pull: { children: id } });
    }
    if (newParentId) {
      await Parent.findByIdAndUpdate(newParentId, { $addToSet: { children: id } });
    }
  }

  const updated = await Student.findByIdAndUpdate(
    id,
    {
      rollNumber,
      classId: classId || undefined,
      parentId: newParentId,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      address,
      admissionDate: admissionDate || undefined,
    },
    { new: true }
  )
    .populate("userId", "name email")
    .populate("classId")
    .populate({ path: "parentId", populate: { path: "userId", select: "name email" } });

  return successResponse(updated, "Student updated");
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;

  await connectToDatabase();
  const deleted = await Student.findByIdAndDelete(id);
  if (!deleted) {
    return errorResponse("Student not found", 404);
  }
  return successResponse(null, "Student removed");
}
