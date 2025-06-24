import { usePendingAssociationTableState } from "@/widgets/association-table/state/pending";
import {
  AssociationTableRow,
  TableAssociation,
  TableAssociationSource,
} from "../transfer/project";

function convertRow(source: AssociationTableRow): TableAssociation {
  return {
    id: source.uuid,
    title: source.title,
    layers: source.columns.map((cell) => ({
      layerIdentifier: cell.columnIdentifier,
      layerValue: cell.cellValue,
    })),
  };
}

export function useAssociations(
  source: TableAssociationSource,
): TableAssociation[] {
  const pendingTableState = usePendingAssociationTableState();

  switch (source.constructor) {
    case "table":
      const state = pendingTableState(source.table);
      if (state) {
        return state.rows.map(convertRow);
      } else {
        return [];
      }
    case "const":
      return source.const.associations;
  }
}
