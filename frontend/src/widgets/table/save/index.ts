import { TableDefinition, TableState } from "@/lib/transfer/project";
import { usePendingTableState } from "../state/pending";
import { useContext } from "react";
import { GroveContext } from "@/lib/transfer/context";
import { GroveTemplateContext } from "@/lib/templates/context";
import { useGroveStore } from "@/lib/state/state";

export function emptyTableState(): TableState {
  return {
    selectedCellOptions: [],
    selectedColumnAssociations: [],
    selectedRowAssociations: [],
  };
}

export function useRenderTable(): (table: TableDefinition) => string {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);
  const pendingFacts = useGroveStore((state) => state.pendingTableFacts);
  const getState = usePendingTableState();

  return (definition) => {
    const state = getState(definition.widgetId) ?? emptyTableState();

    const facts = Object.values(pendingFacts[definition.widgetId] ?? {});

    return templates.table({
      state,
      metadata: context.projectMetadata,
      definition,
      facts,
    });
  };
}
