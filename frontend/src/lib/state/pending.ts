import {
  useCountPendingShowDeclarationFacts,
  useShowDeclarationFactSummaries,
} from "@/widgets/show-declaration/state/pending";
import { useGroveStore } from "./state";
import { FactSummary } from "../fact/summary";
import {
  useAssociationTableFactSummaries,
  useCountPendingAssociationTableFacts,
  useCountPendingAssociationTableStates,
} from "@/widgets/association-table/state/pending";
import {
  useCountPendingTableFacts,
  useCountPendingTableStates,
  useTableFactSummaries,
} from "@/widgets/table/state/pending";

export function useCountPendingChanges(): number {
  const showDeclarationFact = useCountPendingShowDeclarationFacts();
  const associationTableState = useCountPendingAssociationTableStates();
  const associationTableFact = useCountPendingAssociationTableFacts();
  const tableState = useCountPendingTableStates();
  const tableFact = useCountPendingTableFacts();

  return (
    showDeclarationFact +
    associationTableState +
    associationTableFact +
    tableState +
    tableFact
  );
}

export function useClearPendingChanges(): () => void {
  const {
    clearPendingShowDeclarationFacts,
    clearPendingAssociationTableFacts,
    clearPendingAssociationTableStates,
    clearPendingTableFacts,
    clearPendingTableStates,
  } = useGroveStore();

  return () => {
    clearPendingShowDeclarationFacts();
    clearPendingAssociationTableFacts();
    clearPendingAssociationTableStates();
    clearPendingTableFacts();
    clearPendingTableStates();
  };
}

export function useFactSummaries(): FactSummary[] {
  const showDeclaration = useShowDeclarationFactSummaries();
  const associationTable = useAssociationTableFactSummaries();
  const table = useTableFactSummaries();

  return [...showDeclaration, ...associationTable, ...table];
}
