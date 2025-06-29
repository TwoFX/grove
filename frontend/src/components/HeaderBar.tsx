"use client";

import { JSX } from "react";
import Image from "next/image";
import { SaveButton } from "./SaveButton";
import { ClearButton } from "./ClearButton";

export function HeaderBar(): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 p-2 border-b">
      <div className="flex gap-4">
        <Image
          src="/lean_logo.svg"
          alt="Lean Logo"
          width={70}
          height={40}
          priority
        />
        <span className="text-2xl flex items-center">Grove alpha</span>
      </div>
      <div className="flex gap-2">
        <ClearButton />
        <SaveButton />
      </div>
    </div>
  );
}
