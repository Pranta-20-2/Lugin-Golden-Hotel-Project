import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ToastProvider from "@/components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Al Asdiqa Al Masia Hotel — Hotel Booking System",
  description: "Al Asdiqa Al Masia Hotel Hotel Management Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-gray-900`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}