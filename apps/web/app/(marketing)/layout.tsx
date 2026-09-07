import { DM_Sans, Oswald } from "next/font/google";

// Fonts for the marketing surface only. The Volcanic Graphic reference (PRD §6)
// is Oswald display + DM Sans body; the product routes still run on the system
// stack, so the faces are loaded here rather than in the root layout. The CSS
// variables are what app/globals.css reads under `.landing`.
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${oswald.variable} ${dmSans.variable}`}>{children}</div>;
}
