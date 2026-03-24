import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthGuard } from "@/components/AuthGuard";
import "./styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collaborative Notes",
  description: "Real-time collaborative note taking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}