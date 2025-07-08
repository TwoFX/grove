import type { Metadata } from "next";
import "./globals.css";
import { groveContextData } from "@/lib/transfer/metadata";
import { templates } from "@/lib/templates/server";
import { HeaderBar } from "@/components/header/HeaderBar";
import { GroveClient } from "@/components/GroveClient";

export const metadata: Metadata = {
  title: "Grove",
  description: "Grove Lean library QA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GroveClient
          groveContext={groveContextData}
          templateStrings={templates}
        >
          <header>
            <HeaderBar />
          </header>
          <main>{children}</main>
        </GroveClient>
      </body>
    </html>
  );
}
