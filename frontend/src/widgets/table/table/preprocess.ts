import { GroveContextData } from "@/lib/transfer/contextdata";
import {
  TableAssociation,
  TableAssociationLayer,
  TableAssociationLayerData,
  TableCellDataForLayer,
  TableCellOption,
} from "@/lib/transfer/project";
import {
  declarationDisplayLong,
  declarationDisplayShort,
} from "@/lib/transfer/util";

export interface IndexableCellData {
  cellOptions: {
    [rowAssociationId: string]: {
      [columnAssociationId: string]: {
        [sourceLayerIdentifier: string]: TableCellOption[];
      };
    };
  };
  targetLayerIdentifier: {
    [rowAssociationId: string]: {
      [sourceLayerIdentifier: string]: string;
    };
  };
}

export function computeIndexableCellData(
  cells: TableCellDataForLayer[],
): IndexableCellData {
  const result: IndexableCellData = {
    cellOptions: {},
    targetLayerIdentifier: {},
  };

  for (const layer of cells) {
    const sourceLayerIdentifier = layer.sourceLayerIdentifier;

    for (const row of layer.rows) {
      const rowKey = row.rowKey;
      const targetLayerIdentifier = row.targetLayerIdentifier;

      if (!result.cellOptions[rowKey]) {
        result.cellOptions[rowKey] = {};
      }

      if (!result.targetLayerIdentifier[rowKey]) {
        result.targetLayerIdentifier[rowKey] = {};
      }

      result.targetLayerIdentifier[rowKey][sourceLayerIdentifier] =
        targetLayerIdentifier;

      for (const cellEntry of row.cellEntries) {
        const columnKey = cellEntry.columnKey;

        if (!result.cellOptions[rowKey][columnKey]) {
          result.cellOptions[rowKey][columnKey] = {};
        }

        if (!result.cellOptions[rowKey][columnKey][sourceLayerIdentifier]) {
          result.cellOptions[rowKey][columnKey][sourceLayerIdentifier] = [];
        }

        result.cellOptions[rowKey][columnKey][sourceLayerIdentifier].push(
          ...cellEntry.options,
        );
      }
    }
  }

  return result;
}

// TODO: there are by now many variants of this I suppose
export function layerDataKey(option: TableAssociationLayerData): string {
  switch (option.constructor) {
    case "declaration":
      return option.declaration;
    case "other":
      return option.other.value;
  }
}

export function optionDisplayShort(
  context: GroveContextData,
  option: TableAssociationLayerData,
): string {
  switch (option.constructor) {
    case "declaration":
      return declarationDisplayShort(context.declarations[option.declaration]);
    case "other":
      return option.other.shortDescription;
  }
}

export function optionDisplayLong(
  context: GroveContextData,
  option: TableAssociationLayerData,
): string {
  switch (option.constructor) {
    case "declaration":
      return declarationDisplayLong(context.declarations[option.declaration]);
    case "other":
      return option.other.longDescription;
  }
}

export function extractLayers(
  cellData: IndexableCellData,
  layerIdentifier: string,
  rowAssociation: TableAssociation,
  columnAssociation: TableAssociation,
): [TableAssociationLayer, string, TableAssociationLayer] | undefined {
  const rowLayer = rowAssociation.layers.find(
    (lay) => lay.layerIdentifier === layerIdentifier,
  );

  if (!rowLayer) {
    return undefined;
  }

  const rowKey = layerDataKey(rowLayer.data);

  const targetLayerIdentifier =
    cellData.targetLayerIdentifier[rowKey]?.[layerIdentifier];

  const columnLayer = columnAssociation.layers.find(
    (lay) => lay.layerIdentifier === targetLayerIdentifier,
  );

  if (!columnLayer) {
    return undefined;
  }

  return [rowLayer, targetLayerIdentifier, columnLayer];
}
