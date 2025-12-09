"use client";

import { JSX, useEffect, useState } from "react";
import Image from "next/image";
import { SaveButton } from "../SaveButton";
import { ClearButton } from "../ClearButton";
import { Breadcrumbs } from "./Breadcrumbs";
import { RedoButton, UndoButton } from "../UndoRedoButton";
import { ChangeOverview } from "../ChangeOverview";

export function HeaderBar(): JSX.Element {
  const [hasFileSystemAccess, setHasFileSystemAccess] = useState(true);

  useEffect(() => {
    // Check if the File System Access API (showDirectoryPicker) is available
    setHasFileSystemAccess("showDirectoryPicker" in window);
  }, []);

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex gap-2">
        <Image
          src="/lean_logo.svg"
          alt="Lean Logo"
          width={70}
          height={40}
          priority
          className="dark-mode-invert"
        />
        <div className="inline-flex items-baseline gap-6">
          <span className="text-2xl flex items-center">Grove alpha</span>
          <Breadcrumbs />
        </div>
      </div>
      {!hasFileSystemAccess && (
        <div
          className="px-3 py-1.5 text-sm font-semibold rounded"
          style={{
            backgroundColor: "var(--status-warning-bg)",
            color: "var(--status-warning-text)",
            borderColor: "var(--status-warning-border)",
            border: "1px solid",
          }}
        >
          Saving not supported in this browser
        </div>
      )}
      <div className="flex gap-6">
        <div className="flex">
          <UndoButton />
          <RedoButton />
        </div>
        <div className="flex gap-2">
          <ClearButton />
          <SaveButton />
          <ChangeOverview />
        </div>
      </div>
    </div>
  );
}
