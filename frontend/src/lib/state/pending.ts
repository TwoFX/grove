import { useCountPendingShowDeclarationFacts } from "@/widgets/show-declaration/state/pending";
import { useGroveStore } from "./state";

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
