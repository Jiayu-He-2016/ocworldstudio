import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCWorld Studio - a creative page builder for original worlds",
  description: "A calm digital sketchbook for original characters, stories, notes, and worldbuilding pages.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
