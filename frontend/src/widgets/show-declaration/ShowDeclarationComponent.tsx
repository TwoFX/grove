import { LeafWidget } from "@/components/LeafWidget";
import {
  Declaration,
  FactStatus,
  ShowDeclaration,
  ShowDeclarationFact,
} from "@/transfer";
import { JSX } from "react";
import {
  BsCheckLg,
  BsClock,
  BsEmojiSmile,
  BsExclamationLg,
} from "react-icons/bs";

function FactStatusIcon({
  factStatus,
}: {
  factStatus: FactStatus;
}): JSX.Element {
  switch (factStatus) {
    case FactStatus.Done:
      return <BsCheckLg />;
    case FactStatus.Bad:
      return <BsExclamationLg />;
    case FactStatus.BelievedGood:
      return <BsEmojiSmile />;
    case FactStatus.NothingToDo:
      return <BsCheckLg />;
    case FactStatus.Postponed:
      return <BsClock />;
  }
}

function Fact({ fact }: { fact: ShowDeclarationFact }): JSX.Element {
  return (
    <div className="flex items-center">
      {fact.validationResult.constructor === "ok" ? (
        <>
          <FactStatusIcon factStatus={fact.metadata.status} />
          <BsCheckLg />
        </>
      ) : (
        <>
          (<FactStatusIcon factStatus={fact.metadata.status} />)
          <BsExclamationLg />
          <span>{fact.validationResult.invalidated.shortDescription}</span>
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
        <p className="font-mono">{statement(showDeclaration.declaration)}</p>
        {showDeclaration.facts.map((fact) => (
          <Fact fact={fact} key={fact.factId} />
        ))}
      </div>
    </LeafWidget>
  );
}
