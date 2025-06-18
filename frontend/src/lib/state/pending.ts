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

export function useCountPendingChanges(): number {
  const showDeclarationFact = useCountPendingShowDeclarationFacts();
  const associationTableState = useCountPendingAssociationTableStates();
  const associationTableFact = useCountPendingAssociationTableFacts();

  return showDeclarationFact + associationTableState + associationTableFact;
}

export function useClearPendingChanges(): () => void {
  const clearPendingShowDeclarationFacts = useGroveStore(
    (store) => store.clearPendingShowDeclarationFacts,
  );
  const clearPendingAssociationTableFacts = useGroveStore(
    (store) => store.clearPendingAssociationTableFacts,
  );
  const clearPendingAssociationTableStates = useGroveStore(
    (store) => store.clearPendingAssociationTableStates,
  );

  return () => {
    clearPendingShowDeclarationFacts();
    clearPendingAssociationTableFacts();
    clearPendingAssociationTableStates();
  };
}

export function useFactSummaries(): FactSummary[] {
  const showDeclaration = useShowDeclarationFactSummaries();
  const associationTable = useAssociationTableFactSummaries();

  return [...showDeclaration, ...associationTable];
}
