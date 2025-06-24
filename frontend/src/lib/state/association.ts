import { usePendingAssociationTableState } from "@/widgets/association-table/state/pending";
import {
  AssociationTableCellOption,
  AssociationTableDefinition,
  AssociationTableRow,
  TableAssociation,
  TableAssociationLayerData,
  TableAssociationSource,
} from "../transfer/project";
import { GroveContext } from "../transfer/context";
import { useContext } from "react";
import { optionFor } from "@/widgets/association-table/state/navigate";
import { GroveContextData } from "../transfer/contextdata";

function convertOption(
  opt: AssociationTableCellOption,
): TableAssociationLayerData {
  return opt;
}

function convertRow(
  context: GroveContextData,
  definition: AssociationTableDefinition,
  source: AssociationTableRow,
): TableAssociation {
  const descriptionByIdentifier = new Map(
    definition.columns.map((col) => [col.identifier, col]),
  );

  return {
    id: source.uuid,
    title: source.title,
    layers: source.columns.map((cell) => ({
      layerIdentifier: cell.columnIdentifier,
      data: convertOption(
        optionFor(
          context,
          descriptionByIdentifier.get(cell.columnIdentifier)!,
          cell.cellValue,
        )!,
      ),
    })),
  };
}

export function useAssociations(
  source: TableAssociationSource,
): TableAssociation[] {
  const context = useContext(GroveContext);
  const pendingTableState = usePendingAssociationTableState();

  switch (source.constructor) {
    case "table":
      const state = pendingTableState(source.table);
      const definition = context.associationTableDefinition.byId[source.table];
      if (state && definition) {
        return state.rows.map((row) => convertRow(context, definition, row));
      } else {
        return [];
      }
    case "const":
      return source.const.associations;
  }
}
