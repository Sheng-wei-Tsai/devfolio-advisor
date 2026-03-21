import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevFolio Advisor — AI Portfolio Intelligence",
  description: "Get sharp, actionable feedback on your GitHub repos from AI advisors specialized in Frontend, Backend, and UX/UI.",
  keywords: ["portfolio", "github", "ai", "developer", "code review", "career"],
  authors: [{ name: "Sheng-wei Tsai" }],
  openGraph: {
    title: "DevFolio Advisor",
    description: "AI-powered portfolio intelligence for developers. Get expert feedback on your GitHub repos.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DevFolio Advisor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevFolio Advisor",
    description: "AI-powered portfolio intelligence for developers.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="scanlines">
        {children}
      </body>
    </html>
  );
}
