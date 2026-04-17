import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RDS — Medical College Facility Planning",
  description: "Enterprise Room Data Sheet (RDS) management system",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export const viewport = {
  themeColor: "#020b1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}