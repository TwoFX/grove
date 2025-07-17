import type { Metadata } from "next";
import "./globals.css";
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
  const haveUpstreamInvalidatedFacts = process.env
    .GROVE_UPSTREAM_INVALIDATED_FACTS_LOCATION
    ? true
    : false;

  return (
    <html lang="en">
      <body>
        <GroveClient
          haveUpstreamInvalidatedFacts={haveUpstreamInvalidatedFacts}
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
