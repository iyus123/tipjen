import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (body?.password !== env.adminPassword) {
    return NextResponse.json({ error: "Password admin salah." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("tipjen_admin_session", "logged_in", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
