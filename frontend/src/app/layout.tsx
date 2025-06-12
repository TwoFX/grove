import type { Metadata } from "next";
import "./globals.css";
import {
  groveContextData,
  projectMetadata,
  rootNode,
} from "@/lib/transfer/metadata";
import { templates } from "@/lib/templates/server";
import { HeaderBar } from "@/components/HeaderBar";
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
        <GroveClient groveContext={groveContextData}>
          <header>
            <HeaderBar
              rootNode={rootNode}
              templateStrings={templates}
              projectMetadata={projectMetadata}
            />
          </header>
          <main>{children}</main>
        </GroveClient>
      </body>
    </html>
  );
}
