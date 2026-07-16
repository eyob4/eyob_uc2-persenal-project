import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "./ClientShell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Student Management System",
  description: "High school SMS built with Next.js, Tailwind, Express, and MongoDB.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-orange-50">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
