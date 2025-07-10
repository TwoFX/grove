"use client";

import { LeafWidget } from "@/components/LeafWidget";
import { useGroveStore } from "@/lib/state/state";
import {
  Declaration,
  FactStatus,
  ShowDeclaration,
} from "@/lib/transfer/project";
import { JSX, useContext } from "react";
import {
  computeShowDeclarationFactSummary,
  usePendingShowDeclarationFact,
} from "./state/pending";
import { GroveContext } from "@/lib/transfer/context";
import { Fact } from "@/components/fact/Fact";

function ShowDeclarationFactComponent({
  widgetId,
  factId,
  newState,
}: {
  widgetId: string;
  factId: string;
  newState: Declaration;
}): JSX.Element {
  const context = useContext(GroveContext);
  const fact = usePendingShowDeclarationFact()(widgetId, factId);
  const setPendingFact = useGroveStore(
    (state) => state.setPendingShowDeclarationFact,
  );

  const onAssert: (status: FactStatus, message: string) => void = (
    status,
    message,
  ) =>
    setPendingFact(widgetId, factId, {
      widgetId: widgetId,
      factId: factId,
      metadata: { status: status, comment: message },
      state: newState,
      validationResult: {
        constructor: "new",
      },
    });

  return (
    <Fact
      fact={fact && computeShowDeclarationFactSummary(context, fact)}
      onAssert={onAssert}
    />
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
  const context = useContext(GroveContext);

  return (
    <LeafWidget
      widgetType="Declaration"
      id={showDeclaration.definition.id}
      title={showDeclaration.definition.name}
    >
      <div>
        <p className="font-mono">
          {statement(
            context.declarations[showDeclaration.definition.declarationKey],
          )}
        </p>
        <ShowDeclarationFactComponent
          factId="0"
          widgetId={showDeclaration.definition.id}
          newState={
            context.declarations[showDeclaration.definition.declarationKey]
          }
        />
      </div>
    </LeafWidget>
  );
}
