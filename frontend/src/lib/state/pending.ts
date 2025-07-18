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
import {
  useAssertionFactSummaries,
  useCountPendingAssertionFacts,
} from "@/widgets/assertion/state/pending";

export function useCountPendingChanges(): number {
  const showDeclarationFact = useCountPendingShowDeclarationFacts();
  const associationTableState = useCountPendingAssociationTableStates();
  const associationTableFact = useCountPendingAssociationTableFacts();
  const tableState = useCountPendingTableStates();
  const tableFact = useCountPendingTableFacts();
  const assertionFact = useCountPendingAssertionFacts();

  return (
    showDeclarationFact +
    associationTableState +
    associationTableFact +
    tableState +
    tableFact +
    assertionFact
  );
}

export function useClearPendingChanges(): () => void {
  const {
    clearPendingShowDeclarationFacts,
    clearPendingAssociationTableFacts,
    clearPendingAssociationTableStates,
    clearPendingTableFacts,
    clearPendingTableStates,
    clearPendingAssertionFacts,
  } = useGroveStore();

  return () => {
    clearPendingShowDeclarationFacts();
    clearPendingAssociationTableFacts();
    clearPendingAssociationTableStates();
    clearPendingTableFacts();
    clearPendingTableStates();
    clearPendingAssertionFacts();
  };
}

export function useFactSummaries(): FactSummary[] {
  const showDeclaration = useShowDeclarationFactSummaries();
  const associationTable = useAssociationTableFactSummaries();
  const table = useTableFactSummaries();
  const assertion = useAssertionFactSummaries();

  return [...showDeclaration, ...associationTable, ...table, ...assertion];
}
