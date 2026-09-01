import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Munshi",
  description: "Give us your requirements once. We find and qualify flats until you have three worth visiting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
