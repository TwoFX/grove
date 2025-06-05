import { ShowDeclaration } from "@/transfer";
import { JSX } from "react";

export function ShowDeclarationComponent({
  showDeclaration,
}: {
  showDeclaration: ShowDeclaration;
}): JSX.Element {
  switch (showDeclaration.declaration.constructor) {
    case "def":
      return <div>{showDeclaration.declaration.def.renderedStatement}</div>;
    case "thm":
      return <div>{showDeclaration.declaration.thm.renderedStatement}</div>;
    case "missing":
      return <div>Missing: {showDeclaration.declaration.missing}</div>;
  }
}
