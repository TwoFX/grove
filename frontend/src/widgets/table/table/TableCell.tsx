import { JSX, useContext } from "react";
import { extractLayers, IndexableCellData, layerDataKey } from "./preprocess";
import { buildFactId, buildFactIdentifier } from "./fact";
import { TableAssociation } from "@/lib/transfer/project";
import { usePendingTableFact } from "../state/pending";
import { GroveContext } from "@/lib/transfer/context";
import { factBackgroundColor } from "@/lib/fact/color";

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
    return <span className="text-gray-500">·</span>;
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
  widgetId,
  selectedLayers,
  cellData,
  rowAssociation,
  columnAssociation,
}: {
  widgetId: string;
  selectedLayers: string[];
  cellData: IndexableCellData;
  rowAssociation: TableAssociation | undefined;
  columnAssociation: TableAssociation | undefined;
}): JSX.Element {
  const pendingTableFact = usePendingTableFact();
  const context = useContext(GroveContext);

  if (!rowAssociation || !columnAssociation) {
    return (
      <div className="flex h-full w-full justify-center items-center">?</div>
    );
  }

  const factId = buildFactId(
    buildFactIdentifier(
      rowAssociation.id,
      columnAssociation.id,
      selectedLayers,
    ),
  );
  const fact = pendingTableFact(widgetId, factId);
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
      {selectedLayers.map((layerIdentifier, index: number) => (
        <span key={index}>
          <TableCellEntry
            rowAssociation={rowAssociation}
            columnAssociation={columnAssociation}
            layerIdentifier={layerIdentifier}
            cellData={cellData}
          />
          {index < selectedLayers.length - 1 && (
            <span className="text-gray-300">|</span>
          )}
        </span>
      ))}
    </div>
  );
}
