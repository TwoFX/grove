import { LeafWidget } from "@/components/LeafWidget";
import { useGroveStore } from "@/state/state";
import {
  Declaration,
  FactStatus,
  ShowDeclaration,
  ShowDeclarationFact,
} from "@/transfer";
import { JSX, ReactElement } from "react";
import { BsCheck, BsChevronDown, BsExclamation } from "react-icons/bs";

function Fact({ fact }: { fact: ShowDeclarationFact }): JSX.Element {
  return (
    <div className="flex items-center">
      {fact.metadata.status === FactStatus.Done ? (
        <BsCheck />
      ) : (
        <BsExclamation />
      )}
      {fact.validationResult.constructor === "ok" ? (
        <BsCheck />
      ) : (
        <>
          <BsExclamation />
          <span>{fact.validationResult.invalidated}</span>
        </>
      )}
    </div>
  );
}

function statement(declaration: Declaration): string {
  switch (declaration.constructor) {
    case "def":
      return declaration.def.renderedStatement;
    case "thm":
      return declaration.thm.renderedStatement;
    case "missing":
      return "Missing: " + declaration.missing;
  }
}

export function ShowDeclarationComponent({
  showDeclaration,
}: {
  showDeclaration: ShowDeclaration;
}): JSX.Element {
  return (
    <LeafWidget
      widgetType="Declaration"
      id={showDeclaration.id}
      title={showDeclaration.name}
    >
      <div>
        {showDeclaration.facts.map((fact) => (
          <Fact fact={fact} key={fact.factId} />
        ))}
        <p>{statement(showDeclaration.declaration)}</p>
      </div>
    </LeafWidget>
  );
}
