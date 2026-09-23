import { RenderedWidget, renderWidget, tableData } from "@/lib/save/json";
import {
  TableAssociation,
  TableDefinition,
  TableState,
} from "@/lib/transfer/project";
import { usePendingTableState } from "../state/pending";
import { useContext } from "react";
import { GroveContext } from "@/lib/transfer/context";
import { GroveTemplateContext } from "@/lib/templates/context";
import { useGroveStore } from "@/lib/state/state";
import { useAssociations } from "@/lib/state/association";
import {
  computeIndexableCellData,
  extractLayers,
  IndexableCellData,
  layerDataKey,
  lookupCellOptions,
} from "../table/preprocess";

export function emptyTableState(): TableState {
  return {
    selectedLayers: [],
    selectedCellOptions: [],
    selectedColumnAssociations: [],
    selectedRowAssociations: [],
  };
}

// Drop selected rows, columns and cell options that no longer exist, so that we
// don't keep saving selections the table can't display. Selections for hidden
// but existing rows, columns and layers are kept. `selectedLayers` is left
// alone: it is part of every fact id, so pruning it would change which facts
// the table shows.
export function pruneTableState(
  cellData: IndexableCellData,
  rowAssociations: TableAssociation[],
  columnAssociations: TableAssociation[],
  state: TableState,
): TableState {
  const rowsById = new Map(rowAssociations.map((assoc) => [assoc.id, assoc]));
  const columnsById = new Map(
    columnAssociations.map((assoc) => [assoc.id, assoc]),
  );

  return {
    ...state,
    selectedRowAssociations: state.selectedRowAssociations.filter((id) =>
      rowsById.has(id),
    ),
    selectedColumnAssociations: state.selectedColumnAssociations.filter((id) =>
      columnsById.has(id),
    ),
    selectedCellOptions: state.selectedCellOptions.flatMap((selection) => {
      const rowAssociation = rowsById.get(selection.rowValue);
      const columnAssociation = columnsById.get(selection.columnValue);
      if (!rowAssociation || !columnAssociation) return [];

      const layers = extractLayers(
        cellData,
        selection.layerIdentifier,
        rowAssociation,
        columnAssociation,
      );
      if (!layers) return [];

      const [rowLayer, , columnLayer] = layers;
      const options =
        lookupCellOptions(
          cellData,
          selection.layerIdentifier,
          rowLayer,
          columnLayer,
        ) ?? [];
      const optionIds = new Set(options.map((opt) => layerDataKey(opt)));

      const selectedCellOptions = selection.selectedCellOptions.filter((id) =>
        optionIds.has(id),
      );
      return selectedCellOptions.length === 0
        ? []
        : [{ ...selection, selectedCellOptions }];
    }),
  };
}

export function useRenderTable(): (table: TableDefinition) => RenderedWidget {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);
  const pendingFacts = useGroveStore((state) => state.pendingTableFacts);
  const getState = usePendingTableState();
  const associations = useAssociations();

  return (definition) => {
    const state = pruneTableState(
      computeIndexableCellData(definition.cells),
      associations(definition.rowSource),
      associations(definition.columnSource),
      getState(definition.widgetId) ?? emptyTableState(),
    );

    const baseFacts = context.tableFact.byId[definition.widgetId] ?? {};
    const pendings = Object.values(pendingFacts[definition.widgetId] ?? {});

    const pendingFactIds = new Set(pendings.map((fact) => fact.factId));

    const allFacts = [
      ...Object.values(baseFacts).filter(
        (fact) => !pendingFactIds.has(fact.factId),
      ),
      ...pendings,
    ];

    return renderWidget(
      templates.table({ metadata: context.projectMetadata, definition }),
      tableData(definition.widgetId, state, allFacts),
    );
  };
}
