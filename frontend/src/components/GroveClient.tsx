"use client";

import { GroveContext } from "@/lib/transfer/context";
import { JSX, ReactNode } from "react";
import { HashCheck } from "./HashCheck";
import { GroveContextData } from "@/lib/transfer/contextdata";

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
