"use client";

import { ReferenceWidget } from "@/components/ReferenceWidget";
import { useGroveStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import { GroveContextData } from "@/lib/transfer/contextdata";
import {
  AssociationTableDefinition,
  AssociationTableState,
  Reference,
} from "@/lib/transfer/project";
import {
  cellFor,
  columnDescriptionFor,
  optionFor,
  optionReference,
} from "@/widgets/association-table/state/navigate";
import { usePendingAssociationTableState } from "@/widgets/association-table/state/pending";
import { AssociationTable } from "@/widgets/association-table/table/AssociationTable";
import { JSX, useContext, useState } from "react";

function selectedReference(
  context: GroveContextData,
  definition: AssociationTableDefinition,
  tableState: AssociationTableState,
  selectedCell: { rowIdentifier: string; columnIdentifier: string },
): Reference {
  const emptyResult: Reference = { constructor: "none" };

  const column = columnDescriptionFor(
    definition.columns,
    selectedCell.columnIdentifier,
  );

  if (!column) {
    return emptyResult;
  }

  const row = tableState.rows.find(
    (row) => row.uuid === selectedCell.rowIdentifier,
  );

  if (!row) {
    return emptyResult;
  }

  const cell = cellFor(row, selectedCell.columnIdentifier);

  if (!cell) {
    return emptyResult;
  }

  const option = optionFor(column, cell.cellValue);

  if (!option) {
    return emptyResult;
  }

  return optionReference(option);
}

export function AssociationTablePage({
  widgetId,
}: {
  widgetId: string;
}): JSX.Element {
  const context = useContext(GroveContext);
  const tableState = usePendingAssociationTableState()(widgetId);
  const setTableState = useGroveStore(
    (state) => state.setPendingAssociationTableState,
  );
  const [selectedCell, setSelectedCell] = useState({
    rowIdentifier: "",
    columnIdentifier: "",
  });

  if (!tableState) {
    throw new Error("Unknown association table");
  }

  const tableDefinition = context.associationTableDefinition.byId[widgetId];

  const reference = selectedReference(
    context,
    tableDefinition,
    tableState,
    selectedCell,
  );

  return (
    <div>
      <AssociationTable
        widgetId={widgetId}
        columnDefinitions={tableDefinition.columns}
        tableRows={tableState.rows}
        setTableRows={(rows) => setTableState(widgetId, { rows })}
        dataKind={tableDefinition.dataKind}
        setSelectedCell={setSelectedCell}
      />
      <ReferenceWidget reference={reference} />
    </div>
  );
}
