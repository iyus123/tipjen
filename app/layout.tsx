import "./globals.css";
import type { Metadata } from "next";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: `${env.storeName} Admin`,
  description: `Dashboard admin cozy untuk mengelola katalog ${env.storeName}`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
