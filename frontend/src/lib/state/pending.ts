import {
  useCountPendingShowDeclarationFacts,
  useShowDeclarationFactSummaries,
} from "@/widgets/show-declaration/state/pending";
import { useGroveStore } from "./state";
import { FactSummary } from "../fact/summary";

export function useCountPendingFacts(): number {
  const showDeclaration = useCountPendingShowDeclarationFacts();

  return showDeclaration;
}

export function useClearPendingFacts(): () => void {
  const clearPendingShowDeclarationFacts = useGroveStore(
    (store) => store.clearPendingShowDeclarationFacts,
  );

  return () => {
    clearPendingShowDeclarationFacts();
  };
}

export function useFactSummaries(): FactSummary[] {
  const showDeclaration = useShowDeclarationFactSummaries();

  return showDeclaration;
}
