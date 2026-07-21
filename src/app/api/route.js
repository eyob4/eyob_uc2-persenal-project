import { NextResponse } from "next/server";
import { ensureDemoUsers } from "@/lib/db";

export async function GET() {
  await ensureDemoUsers();
  return NextResponse.json({ message: "Student Management System API is running" });
}

export async function POST() {
  await ensureDemoUsers();
  return NextResponse.json({ message: "Student Management System API is running" });
}
