import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lean Library Manager",
  description: "This is the as-yet-unnamed Lean Library Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
