import { JSX } from "react";
import { IndexableCellData } from "./preprocess";
import { buildFactId, buildFactIdentifier } from "./fact";
import {
  FactStatus,
  TableAssociation,
  TableAssociationLayerData,
} from "@/lib/transfer/project";
import { usePendingTableFact } from "../state/pending";

// TODO: there are by now many variants of this I suppose
function optionKey(option: TableAssociationLayerData): string {
  switch (option.constructor) {
    case "declaration":
      return option.declaration;
    case "other":
      return option.other.value;
  }
}

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
  const invalidResult = <span className="text-gray-500">·</span>;

  const rowLayer = rowAssociation.layers.find(
    (lay) => lay.layerIdentifier === layerIdentifier,
  );

  if (!rowLayer) {
    return invalidResult;
  }

  const rowKey = optionKey(rowLayer.data);

  const targetLayerIdentifier =
    cellData.targetLayerIdentifier[rowKey]?.[layerIdentifier];

  const columnLayer = columnAssociation.layers.find(
    (lay) => lay.layerIdentifier === targetLayerIdentifier,
  );

  if (!columnLayer) {
    return invalidResult;
  }

  const colKey = optionKey(columnLayer.data);

  return (
    <span>{cellData.cellOptions[rowKey][colKey][layerIdentifier].length}</span>
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
  let color: string;
  if (!fact) {
    color = "";
  } else {
    switch (fact.metadata.status) {
      case FactStatus.Done:
        color = "bg-green-100";
        break;
      case FactStatus.Bad:
        color = "bg-red-100";
        break;
      case FactStatus.BelievedGood:
        color = "bg-blue-100";
        break;
      case FactStatus.NothingToDo:
        color = "bg-gray-100";
        break;
      case FactStatus.Postponed:
        color = "bg-yellow-100";
        break;
    }
  }

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
