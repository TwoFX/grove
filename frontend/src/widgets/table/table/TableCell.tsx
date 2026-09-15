import { JSX, useContext } from "react";
import { extractLayers, IndexableCellData, layerDataKey } from "./preprocess";
import {
  TableAssociation,
  TableDefinition,
  TableState,
} from "@/lib/transfer/project";
import { factBackgroundColor } from "@/lib/fact/color";
import { InvalidatedFactsContext } from "@/lib/fact/invalidated/context";
import { useTableFact } from "./useTableFact";

function TableCellEntry({
  rowAssociation,
  columnAssociation,
  layerIdentifier,
  cellData,
}: {
  rowAssociation: TableAssociation;
  columnAssociation: TableAssociation;
  layerIdentifier: string;
  cellData: IndexableCellData;
}): JSX.Element {
  const rowCol = extractLayers(
    cellData,
    layerIdentifier,
    rowAssociation,
    columnAssociation,
  );

  if (!rowCol) {
    return <span className="text-text-tertiary">·</span>;
  }

  const [rowLayer, , columnLayer] = rowCol;

  const colKey = layerDataKey(columnLayer.data);

  return (
    <span>
      {cellData.cellOptions[layerDataKey(rowLayer.data)][colKey]?.[
        layerIdentifier
      ]?.length ?? 0}
    </span>
  );
}

export function TableCell({
  definition,
  state,
  cellData,
  rowAssociation,
  columnAssociation,
}: {
  definition: TableDefinition;
  state: TableState;
  cellData: IndexableCellData;
  rowAssociation: TableAssociation | undefined;
  columnAssociation: TableAssociation | undefined;
}): JSX.Element {
  const context = useContext(InvalidatedFactsContext);
  const tableFact = useTableFact({
    definition,
    cellData,
    state,
    selectedCell: {
      rowAssociationId: rowAssociation?.id ?? "",
      columnAssociationId: columnAssociation?.id ?? "",
    },
  });

  if (!rowAssociation || !columnAssociation) {
    return (
      <div className="flex h-full w-full justify-center items-center">?</div>
    );
  }

  const fact = tableFact?.fact;
  const color = fact
    ? factBackgroundColor(
        context,
        fact.widgetId,
        fact.factId,
        fact.validationResult,
        fact.metadata.status,
      )
    : "";

  return (
    <div className={`flex h-full w-full justify-center items-center ${color}`}>
      {state.selectedLayers.map((layerIdentifier, index: number) => (
        <span key={index}>
          <TableCellEntry
            rowAssociation={rowAssociation}
            columnAssociation={columnAssociation}
            layerIdentifier={layerIdentifier}
            cellData={cellData}
          />
          {index < state.selectedLayers.length - 1 && (
            <span className="text-text-disabled">|</span>
          )}
        </span>
      ))}
    </div>
  );
}
