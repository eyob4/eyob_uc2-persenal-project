import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Parent from "@/models/Parent";

export async function createRoleProfile(role, userId) {
  if (role === "student") return Student.create({ userId });
  if (role === "teacher") return Teacher.create({ userId });
  if (role === "parent") return Parent.create({ userId });
  return null;
}
