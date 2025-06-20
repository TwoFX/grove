import {
  AssociationTableFactCellState,
  FactStatus,
} from "@/lib/transfer/project";
import { JSX } from "react";
import {
  computeAssociationTableFactSummary,
  usePendingAssociationTableFact,
} from "./state/pending";
import { useGroveStore } from "@/lib/state/state";
import { Fact } from "@/components/fact/Fact";

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
      fact={fact && computeAssociationTableFactSummary(fact)}
      onAssert={onAssert}
    />
  );
}
