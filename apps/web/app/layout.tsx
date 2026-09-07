import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Munshi",
  description: "Room to breathe in Bengaluru. Munshi carries your flat search — finding, sifting and qualifying — so you only visit places worth the Saturday.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
