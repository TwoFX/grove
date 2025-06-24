import { TableCellDataForLayer, TableCellOption } from "@/lib/transfer/project";

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
