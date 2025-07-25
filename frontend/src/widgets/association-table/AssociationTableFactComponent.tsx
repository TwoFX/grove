import {
  AssociationTableFactCellState,
  FactStatus,
  FactValidationResult,
} from "@/lib/transfer/project";
import { JSX, useContext } from "react";
import {
  computeAssociationTableFactSummary,
  usePendingAssociationTableFact,
  usePendingAssociationTableState,
} from "./state/pending";
import { useGroveStore } from "@/lib/state/state";
import { Fact } from "@/components/fact/Fact";
import { GroveContext } from "@/lib/transfer/context";
import { associationTableFactStatesEqual } from "./fact";
import { FactSummary } from "@/lib/fact/summary";

export function AssociationTableFactComponent({
  widgetId,
  rowId,
  factId,
  newState,
}: {
  widgetId: string;
  rowId: string;
  factId: string;
  newState: () => AssociationTableFactCellState[];
}): JSX.Element {
  const context = useContext(GroveContext);
  const pendingState = usePendingAssociationTableState();
  const fact = usePendingAssociationTableFact()(widgetId, factId);
  const setPendingFact = useGroveStore(
    (state) => state.setPendingAssociationTableFact,
  );

  const currentState = newState();

  const onAssert: (status: FactStatus, message: string) => void = (
    status,
    message,
  ) =>
    setPendingFact(context, widgetId, factId, {
      widgetId: widgetId,
      factId: factId,
      metadata: { status: status, comment: message },
      rowId: rowId,
      state: currentState,
      validationResult: {
        constructor: "new",
      },
    });

  let factWithInvalidation: FactSummary | undefined;
  if (fact) {
    factWithInvalidation = computeAssociationTableFactSummary(
      context,
      pendingState(fact.widgetId),
      fact,
    );
    if (
      factWithInvalidation.validationResult.constructor !== "invalidated" &&
      !associationTableFactStatesEqual(fact.state, currentState)
    ) {
      const newInvalidation: FactValidationResult = {
        constructor: "invalidated",
        invalidated: {
          shortDescription: "State changed",
          longDescription: "State was changed in the frontend",
        },
      };
      factWithInvalidation = {
        ...factWithInvalidation,
        validationResult: newInvalidation,
      };
    }
  } else {
    factWithInvalidation = undefined;
  }

  return <Fact fact={factWithInvalidation} onAssert={onAssert} />;
}
