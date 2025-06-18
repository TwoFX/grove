"use client";

import { useGroveStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import { emptyAssociationTableState } from "@/widgets/association-table/save";
import { usePendingAssociationTableState } from "@/widgets/association-table/state/pending";
import { AssociationTable } from "@/widgets/association-table/table/AssociationTable";
import { JSX, useContext } from "react";

export function AssociationTablePage({
  widgetId,
}: {
  widgetId: string;
}): JSX.Element {
  const context = useContext(GroveContext);
  const tableState =
    usePendingAssociationTableState()(widgetId) ?? emptyAssociationTableState();
  const setTableState = useGroveStore(
    (state) => state.setPendingAssociationTableState,
  );

  if (!tableState) {
    throw new Error("Unknown association table");
  }

  return (
    <AssociationTable
      columnDefinitions={
        context.associationTableDefinition.byId[widgetId].columns
      }
      tableRows={tableState.rows}
      setTableRows={(rows) => setTableState(widgetId, { rows })}
    />
  );
}
