import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ToastProvider from "@/components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lugin Golden — Hotel Booking System",
  description: "Lugin Golden Hotel Management Application",
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