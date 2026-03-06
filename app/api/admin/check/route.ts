import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const isLoggedIn = cookies().get("tipjen_admin_session")?.value === "logged_in";
  return NextResponse.json({ authenticated: isLoggedIn });
}
