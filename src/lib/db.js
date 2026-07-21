import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "@/lib/models/User";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sms";
let isConnecting = false;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return mongoose.connection;
  }

  isConnecting = true;
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return null;
  } finally {
    isConnecting = false;
  }
}

export async function ensureDemoUsers() {
  const connection = await connectToDatabase();
  if (!connection) {
    return;
  }

  const count = await User.countDocuments();
  if (count > 0) {
    return;
  }

  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedTeacher = await bcrypt.hash("teacher123", 10);
  const hashedStudent = await bcrypt.hash("student123", 10);
  const hashedParent = await bcrypt.hash("parent123", 10);

  await User.create([
    { name: "Admin User", email: "admin@sms.com", password: hashedAdmin, role: "admin" },
    { name: "Teacher User", email: "teacher@sms.com", password: hashedTeacher, role: "teacher" },
    { name: "Student User", email: "student@sms.com", password: hashedStudent, role: "student" },
    { name: "Parent User", email: "parent@sms.com", password: hashedParent, role: "parent" },
  ]);
}
