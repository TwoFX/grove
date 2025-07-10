import { FactSummary } from "@/lib/fact/summary";
import { useGroveStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import { GroveContextData } from "@/lib/transfer/contextdata";
import {
  AssociationTableFact,
  AssociationTableState,
} from "@/lib/transfer/project";
import { useContext } from "react";

export function usePendingAssociationTableFact(): (
  widgetId: string,
  factId: string,
) => AssociationTableFact | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore(
    (state) => state.pendingAssociationTableFacts,
  );

  return (widgetId, factId) => {
    const result =
      pendingFact[widgetId]?.[factId] ??
      groveContextData.associationTableFact.byId[widgetId]?.[factId];
    return result;
  };
}

export function useCountPendingAssociationTableFacts(): number {
  return useGroveStore((state) =>
    Object.values(state.pendingAssociationTableFacts).reduce(
      (sofar, entry) => sofar + Object.keys(entry).length,
      0,
    ),
  );
}

export function usePendingAssociationTableState(): (
  widgetId: string,
) => AssociationTableState | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingState = useGroveStore(
    (state) => state.pendingAssociationTableStates,
  );

  return (widgetId) =>
    pendingState[widgetId] ??
    groveContextData.associationTableState.byId[widgetId];
}

export function useCountPendingAssociationTableStates(): number {
  return useGroveStore(
    (state) => Object.keys(state.pendingAssociationTableStates).length,
  );
}

export function computeAssociationTableFactSummary(
  context: GroveContextData,
  pendingState: AssociationTableState | undefined,
  fact: AssociationTableFact,
): FactSummary {
  const rowTitle: string | undefined = pendingState?.rows.find(
    (row) => row.uuid === fact.rowId,
  )?.title;
  return {
    widgetTitle: context.associationTableDefinition.byId[fact.widgetId].title,
    widgetId: fact.widgetId,
    factId: fact.factId,
    href: `/association/${fact.widgetId}`,
    summary: rowTitle ?? "Unknown",
    metadata: fact.metadata,
    validationResult: fact.validationResult,
  };
}

export function useAssociationTableFactSummaries(): FactSummary[] {
  const groveContextData = useContext(GroveContext);
  const pendingState = usePendingAssociationTableState();
  const pendingFact = useGroveStore(
    (state) => state.pendingAssociationTableFacts,
  );

  return groveContextData.associationTableFact.all.map((fact) => {
    const f = pendingFact[fact.widgetId]?.[fact.factId] ?? fact;
    return computeAssociationTableFactSummary(
      groveContextData,
      pendingState(f.widgetId),
      f,
    );
  });
}
