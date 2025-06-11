import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import { SaveButton } from "@/components/SaveButton";
import { projectMetadata, rootNode } from "@/transfer/metadata";
import { templates } from "@/templates/server";

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
        <header className="flex items-center justify-between gap-4 p-2 border-b">
          <Image
            src="/lean_logo.svg"
            alt="Lean Logo"
            width={70}
            height={40}
            priority
          />
          <SaveButton
            rootNode={rootNode}
            templateStrings={templates}
            projectMetadata={projectMetadata}
          />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
