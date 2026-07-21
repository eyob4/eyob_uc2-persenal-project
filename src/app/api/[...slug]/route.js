import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase, ensureDemoUsers } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import User from "@/lib/models/User";
import Student from "@/lib/models/Student";

const secret = process.env.JWT_SECRET || "sms-secret";

function jsonResponse(data, init = {}) {
  return NextResponse.json(data, init);
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function handleAuth(request) {
  const body = await parseBody(request);
  const { email, password, name, role = "student", studentId, childrenIds } = body;

  if (request.method === "POST" && request.nextUrl.pathname === "/api/auth/register") {
    if (!name || !email || !password || !role) {
      return jsonResponse({ message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await User.findOne({ email });
    if (existing) {
      return jsonResponse({ message: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });

    if (role === "student") {
      user.student = studentId || null;
    }
    if (role === "parent") {
      user.children = childrenIds || [];
    }

    await user.save();
    return jsonResponse({ message: "User registered", user: { id: user._id, name, email, role } }, { status: 201 });
  }

  if (request.method === "POST" && request.nextUrl.pathname === "/api/auth/login") {
    if (!email || !password) {
      return jsonResponse({ message: "Missing credentials" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) {
      return jsonResponse({ message: "Invalid credentials" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return jsonResponse({ message: "Invalid credentials" }, { status: 400 });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "7d" });
    return jsonResponse({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  }

  return jsonResponse({ message: "Not found" }, { status: 404 });
}

async function handleAdmin(request) {
  const auth = await getAuthenticatedUser(request, ["admin"]);
  if (auth.error) {
    return auth.error;
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/api/admin/users" && request.method === "GET") {
    const users = await User.find().select("-password").populate("student children", "name gradeLevel");
    return jsonResponse(users);
  }

  if (pathname === "/api/admin/users" && request.method === "POST") {
    const body = await parseBody(request);
    const { name, email, role, password, studentId, childrenIds } = body;
    if (!name || !email || !role || !password) {
      return jsonResponse({ message: "Missing required fields" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return jsonResponse({ message: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    if (role === "student") user.student = studentId || null;
    if (role === "parent") user.children = childrenIds || [];
    await user.save();
    return jsonResponse({ message: "Created user", user: { id: user._id, name, email, role } }, { status: 201 });
  }

  if (pathname === "/api/admin/students" && request.method === "GET") {
    const students = await Student.find().populate("parent", "name email");
    return jsonResponse(students);
  }

  if (pathname === "/api/admin/students" && request.method === "POST") {
    const body = await parseBody(request);
    const student = new Student(body);
    await student.save();
    return jsonResponse(student, { status: 201 });
  }

  if (pathname.startsWith("/api/admin/students/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = await parseBody(request);
    const student = await Student.findByIdAndUpdate(id, body, { new: true });
    if (!student) {
      return jsonResponse({ message: "Student not found" }, { status: 404 });
    }
    return jsonResponse(student);
  }

  if (pathname.startsWith("/api/admin/students/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return jsonResponse({ message: "Student not found" }, { status: 404 });
    }
    return jsonResponse({ message: "Student removed" });
  }

  return jsonResponse({ message: "Not found" }, { status: 404 });
}

async function handleTeacher(request) {
  const auth = await getAuthenticatedUser(request, ["teacher"]);
  if (auth.error) {
    return auth.error;
  }

  const { pathname } = request.nextUrl;
  const parts = pathname.split("/").filter(Boolean);
  const [, , resource, studentId, action] = parts;

  if (pathname === "/api/teacher/students" && request.method === "GET") {
    const students = await Student.find().populate("parent", "name email");
    return jsonResponse(students);
  }

  if (resource === "teacher" && resource && request.method === "PUT" && studentId && action === "grade") {
    const body = await parseBody(request);
    const student = await Student.findById(studentId);
    if (!student) {
      return jsonResponse({ message: "Student not found" }, { status: 404 });
    }
    student.grades.push({ ...body });
    await student.save();
    return jsonResponse(student);
  }

  if (resource === "teacher" && resource && request.method === "PUT" && studentId && action === "attendance") {
    const body = await parseBody(request);
    const student = await Student.findById(studentId);
    if (!student) {
      return jsonResponse({ message: "Student not found" }, { status: 404 });
    }
    student.attendance.push({ date: body.date ? new Date(body.date) : new Date(), status: body.status });
    await student.save();
    return jsonResponse(student);
  }

  return jsonResponse({ message: "Not found" }, { status: 404 });
}

async function handleStudent(request) {
  const auth = await getAuthenticatedUser(request, ["student"]);
  if (auth.error) {
    return auth.error;
  }

  const { pathname } = request.nextUrl;
  if (pathname === "/api/student/profile" && request.method === "GET") {
    const user = await User.findById(auth.user._id).populate({ path: "student", populate: { path: "parent", select: "name email" } });
    if (!user || !user.student) {
      return jsonResponse({ message: "Student profile not found" }, { status: 404 });
    }
    return jsonResponse({ student: user.student, user: { id: user._id, name: user.name, email: user.email } });
  }

  if (pathname === "/api/student/schedule" && request.method === "GET") {
    const user = await User.findById(auth.user._id).populate("student");
    if (!user || !user.student) {
      return jsonResponse({ message: "Student schedule not found" }, { status: 404 });
    }
    return jsonResponse({ schedule: user.student.schedule });
  }

  if (pathname === "/api/student/grades" && request.method === "GET") {
    const user = await User.findById(auth.user._id).populate("student");
    if (!user || !user.student) {
      return jsonResponse({ message: "Student grades not found" }, { status: 404 });
    }
    return jsonResponse({ grades: user.student.grades });
  }

  return jsonResponse({ message: "Not found" }, { status: 404 });
}

async function handleParent(request) {
  const auth = await getAuthenticatedUser(request, ["parent"]);
  if (auth.error) {
    return auth.error;
  }

  const { pathname } = request.nextUrl;
  const parts = pathname.split("/").filter(Boolean);
  const [, , resource, childId, action] = parts;

  if (pathname === "/api/parent/children" && request.method === "GET") {
    const parent = await User.findById(auth.user._id).populate({ path: "children", populate: { path: "parent", select: "name email" } });
    if (!parent) {
      return jsonResponse({ message: "Parent not found" }, { status: 404 });
    }
    return jsonResponse({ children: parent.children });
  }

  if (resource === "parent" && childId && action === "grades" && request.method === "GET") {
    const parent = await User.findById(auth.user._id);
    const ownsChild = parent?.children?.some((child) => child.toString() === childId);
    if (!parent || !ownsChild) {
      return jsonResponse({ message: "Forbidden: not your child" }, { status: 403 });
    }
    const student = await Student.findById(childId);
    if (!student) {
      return jsonResponse({ message: "Student not found" }, { status: 404 });
    }
    return jsonResponse({ grades: student.grades });
  }

  if (resource === "parent" && childId && action === "attendance" && request.method === "GET") {
    const parent = await User.findById(auth.user._id);
    const ownsChild = parent?.children?.some((child) => child.toString() === childId);
    if (!parent || !ownsChild) {
      return jsonResponse({ message: "Forbidden: not your child" }, { status: 403 });
    }
    const student = await Student.findById(childId);
    if (!student) {
      return jsonResponse({ message: "Student not found" }, { status: 404 });
    }
    return jsonResponse({ attendance: student.attendance });
  }

  if (pathname === "/api/parent/message" && request.method === "POST") {
    const body = await parseBody(request);
    const { studentId, message } = body;
    if (!studentId || !message) {
      return jsonResponse({ message: "Missing studentId or message" }, { status: 400 });
    }
    const parent = await User.findById(auth.user._id);
    if (!parent || !parent.children.includes(studentId)) {
      return jsonResponse({ message: "Forbidden: not your child" }, { status: 403 });
    }
    return jsonResponse({ studentId, message, createdAt: new Date() });
  }

  return jsonResponse({ message: "Not found" }, { status: 404 });
}

export async function GET(request) {
  await ensureDemoUsers();
  const { pathname } = request.nextUrl;
  if (pathname === "/api") {
    return jsonResponse({ message: "Student Management System API is running" });
  }
  if (pathname.startsWith("/api/auth")) {
    return handleAuth(request);
  }
  if (pathname.startsWith("/api/admin")) {
    return handleAdmin(request);
  }
  if (pathname.startsWith("/api/teacher")) {
    return handleTeacher(request);
  }
  if (pathname.startsWith("/api/student")) {
    return handleStudent(request);
  }
  if (pathname.startsWith("/api/parent")) {
    return handleParent(request);
  }
  return jsonResponse({ message: "Not found" }, { status: 404 });
}

export async function POST(request) {
  await ensureDemoUsers();
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/auth")) {
    return handleAuth(request);
  }
  if (pathname.startsWith("/api/admin")) {
    return handleAdmin(request);
  }
  if (pathname.startsWith("/api/teacher")) {
    return handleTeacher(request);
  }
  if (pathname.startsWith("/api/student")) {
    return handleStudent(request);
  }
  if (pathname.startsWith("/api/parent")) {
    return handleParent(request);
  }
  return jsonResponse({ message: "Not found" }, { status: 404 });
}

export async function PUT(request) {
  await ensureDemoUsers();
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/admin")) {
    return handleAdmin(request);
  }
  if (pathname.startsWith("/api/teacher")) {
    return handleTeacher(request);
  }
  return jsonResponse({ message: "Not found" }, { status: 404 });
}

export async function DELETE(request) {
  await ensureDemoUsers();
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/admin")) {
    return handleAdmin(request);
  }
  return jsonResponse({ message: "Not found" }, { status: 404 });
}
