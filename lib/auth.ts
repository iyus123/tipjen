import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

export function isAdminAuthenticated() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return token === process.env.ADMIN_SESSION_TOKEN;
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}
