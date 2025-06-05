import {
  Declaration,
  FactStatus,
  ShowDeclaration,
  ShowDeclarationFact,
} from "@/transfer";
import { JSX } from "react";
import { BsCheck, BsExclamation } from "react-icons/bs";

function Fact({ fact }: { fact: ShowDeclarationFact }): JSX.Element {
  return (
    <div>
      {fact.metadata.status === FactStatus.Done ? (
        <BsCheck />
      ) : (
        <BsExclamation />
      )}
      {fact.validationResult.constructor === "ok" ? (
        <BsCheck />
      ) : (
        <div>
          <BsExclamation /> {fact.validationResult.invalidated}
        </div>
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
    <div>
      {showDeclaration.facts.map((fact) => (
        <Fact fact={fact} key={fact.factId} />
      ))}
      <p>{statement(showDeclaration.declaration)}</p>
    </div>
  );
}
