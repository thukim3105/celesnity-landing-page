import type { Metadata } from "next";

// --- Celesnity Design System (LOCKED source of truth) ---
// Referenced in place; the DS folder is never modified. Tokens load Inter +
// all semantic aliases and the [data-theme] Cosmos/Daybreak scopes.
import "../Celesnity Design System Gradient/tokens/fonts.css";
import "../Celesnity Design System Gradient/tokens/colors.css";
import "../Celesnity Design System Gradient/tokens/typography.css";
import "../Celesnity Design System Gradient/tokens/spacing.css";
import "../Celesnity Design System Gradient/tokens/effects.css";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export const metadata: Metadata = {
  title: "Celesnity — Minder AI",
  description:
    "Celesnity — an AI company. Reach the stars with Minder AI and more.",
};

// Applies the saved theme before first paint to avoid a flash of the wrong
// sky. Default (no attribute) = Cosmos (dark), per the design system.
const themeScript = `(function(){try{var t=localStorage.getItem("celesnity-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/*
          Inter — the brand typeface. The DS ships it via a remote @import in
          tokens/fonts.css, but Turbopack strips remote @imports, so we load the
          identical Google Fonts URL here (same cut the DS declares) to satisfy
          `--font-sans: 'Inter', …`. The DS is not modified.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..700;1,14..32,400..700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SmoothScroll />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
