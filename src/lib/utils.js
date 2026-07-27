import { NextResponse } from "next/server";

export function successResponse(data = null, message = "", init = {}) {
  return NextResponse.json({ success: true, data, message }, init);
}

export function errorResponse(message = "Error", status = 400, init = {}) {
  return NextResponse.json({ success: false, data: null, message }, { status, ...init });
}
