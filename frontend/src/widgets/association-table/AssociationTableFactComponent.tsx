import {
  AssociationTableFactCellState,
  FactStatus,
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

  const onAssert: (status: FactStatus, message: string) => void = (
    status,
    message,
  ) =>
    setPendingFact(widgetId, factId, {
      widgetId: widgetId,
      factId: factId,
      metadata: { status: status, comment: message },
      rowId: rowId,
      state: newState(),
      validationResult: {
        constructor: "new",
      },
    });

  return (
    <Fact
      fact={
        fact &&
        computeAssociationTableFactSummary(
          context,
          pendingState(fact.widgetId),
          fact,
        )
      }
      onAssert={onAssert}
    />
  );
}
