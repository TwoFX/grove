import { GroveContext } from "@/lib/transfer/context";
import { Reference } from "@/lib/transfer/project";
import { declarationDisplayLong } from "@/lib/transfer/util";
import { JSX, useContext } from "react";

function DeclarationWidget({
  declarationId,
}: {
  declarationId: string;
}): JSX.Element {
  const context = useContext(GroveContext);

  const decl = context.declarations[declarationId];

  if (!decl) {
    return <p>Unknown declaration.</p>;
  }

  return <pre className="font-mono mb-1">{declarationDisplayLong(decl)}</pre>;
}

export function ReferenceWidget({
  reference,
}: {
  reference: Reference;
}): JSX.Element {
  switch (reference.constructor) {
    case "declaration":
      return <DeclarationWidget declarationId={reference.declaration} />;
    case "none":
      return (
        <p>
          <i>Nothing to show.</i>
        </p>
      );
  }
}
