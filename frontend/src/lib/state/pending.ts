import {
  useCountPendingShowDeclarationFacts,
  usePendingShowDeclarationChanges,
  useShowDeclarationFactSummaries,
} from "@/widgets/show-declaration/state/pending";
import { FactSummary } from "../fact/summary";
import {
  useAssociationTableFactSummaries,
  useCountPendingAssociationTableFacts,
  useCountPendingAssociationTableStates,
  usePendingAssociationTableChanges,
} from "@/widgets/association-table/state/pending";
import {
  useCountPendingTableFacts,
  useCountPendingTableStates,
  usePendingTableChanges,
  useTableFactSummaries,
} from "@/widgets/table/state/pending";
import {
  useAssertionFactSummaries,
  useCountPendingAssertionFacts,
  usePendingAssertionChanges,
} from "@/widgets/assertion/state/pending";
import { PendingChange } from "./pendingchange";

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

export function usePendingChanges(): PendingChange[] {
  const pendingAssertionChanges = usePendingAssertionChanges();
  const pendingAssociationTableChanges = usePendingAssociationTableChanges();
  const pendingShowDeclarationChanges = usePendingShowDeclarationChanges();
  const pendingTableChanges = usePendingTableChanges();

  return [
    ...pendingAssertionChanges,
    ...pendingAssociationTableChanges,
    ...pendingShowDeclarationChanges,
    ...pendingTableChanges,
  ];
}

export function useFactSummaries(): FactSummary[] {
  const showDeclaration = useShowDeclarationFactSummaries();
  const associationTable = useAssociationTableFactSummaries();
  const table = useTableFactSummaries();
  const assertion = useAssertionFactSummaries();

  return [...showDeclaration, ...associationTable, ...table, ...assertion];
}
