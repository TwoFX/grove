import { FactSummary } from "@/lib/fact/summary";
import { useAssociations } from "@/lib/state/association";
import {
  collectPendingFactAndStateChanges,
  PendingChange,
} from "@/lib/state/pendingchange";
import { useGroveStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import { GroveContextData } from "@/lib/transfer/contextdata";
import {
  TableAssociation,
  TableAssociationSource,
  TableFact,
  TableState,
} from "@/lib/transfer/project";
import { useContext } from "react";

export function usePendingTableFact(): (
  widgetId: string,
  factId: string,
) => TableFact | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore((state) => state.pendingTableFacts);

  return (widgetId, factId) => {
    const result =
      pendingFact[widgetId]?.[factId] ??
      groveContextData.tableFact.byId[widgetId]?.[factId];
    return result;
  };
}

export function useCountPendingTableFacts(): number {
  return useGroveStore((state) =>
    Object.values(state.pendingTableFacts).reduce(
      (sofar, entry) => sofar + Object.keys(entry).length,
      0,
    ),
  );
}

export function usePendingTableState(): (
  widgetId: string,
) => TableState | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingState = useGroveStore((state) => state.pendingTableStates);

  return (widgetId) =>
    pendingState[widgetId] ?? groveContextData.tableState.byId[widgetId];
}

export function useCountPendingTableStates(): number {
  return useGroveStore((state) => Object.keys(state.pendingTableStates).length);
}

export function computeTableFactSummary(
  context: GroveContextData,
  associations: (source: TableAssociationSource) => TableAssociation[],
  fact: TableFact,
): FactSummary {
  const definition = context.tableDefinition.byId[fact.widgetId];
  const rowAssociations = associations(definition.rowSource);
  const columnAssociatßions = associations(definition.columnSource);

  const rowTitle =
    rowAssociations.find(
      (assoc) => assoc.id === fact.identifier.rowAssociationId,
    )?.title ?? "Unknown";
  const colTitle =
    columnAssociatßions.find(
      (assoc) => assoc.id === fact.identifier.columnAssociationId,
    )?.title ?? "Unknown";

  return {
    widgetId: fact.widgetId,
    widgetTitle: definition.title,
    factId: fact.factId,
    href: `/table/${fact.widgetId}`,
    summary: `${rowTitle}/${colTitle}`,
    metadata: fact.metadata,
    validationResult: fact.validationResult,
  };
}

export function useTableFactSummaries(): FactSummary[] {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore((state) => state.pendingTableFacts);
  const associations = useAssociations();

  return groveContextData.tableFact.all.map((fact) => {
    return computeTableFactSummary(
      groveContextData,
      associations,
      pendingFact[fact.widgetId]?.[fact.factId] ?? fact,
    );
  });
}

export function usePendingTableChanges(): PendingChange[] {
  const context = useContext(GroveContext);
  const pendingFacts = useGroveStore((state) => state.pendingTableFacts);
  const pendingStates = useGroveStore((state) => state.pendingTableStates);

  return collectPendingFactAndStateChanges(
    pendingFacts,
    pendingStates,
    context.tableDefinition,
    (def) => def.title,
    "table",
    (state, widgetId) => state.clearPendingTableFacts(widgetId),
    (state, widgetId) => state.clearPendingTableState(widgetId),
  );
}
