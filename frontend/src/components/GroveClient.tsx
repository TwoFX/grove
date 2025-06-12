"use client";

import { GroveContext } from "@/lib/transfer/context";
import { GroveContextData } from "@/lib/transfer/metadata";
import { JSX, ReactNode } from "react";
import { HashCheck } from "./HashCheck";

export function GroveClient({
  children,
  groveContext,
}: {
  children: ReactNode;
  groveContext: GroveContextData;
}): JSX.Element {
  return (
    <GroveContext value={groveContext}>
      <HashCheck>{children}</HashCheck>
    </GroveContext>
  );
}
