import { useGroveStore } from "@/lib/state/state";
import { ShowDeclarationFact } from "@/lib/transfer";
import { GroveContext } from "@/lib/transfer/context";
import { useContext } from "react";

export function usePendingShowDeclarationFact(): (
  widgetId: string,
  key: string,
) => ShowDeclarationFact | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore(
    (state) => state.pendingShowDeclarationFacts,
  );

  return (widgetId, factId) =>
    pendingFact[widgetId]?.[factId] ??
    groveContextData.showDeclarationFact[widgetId]?.[factId];
}

export function useCountPendingShowDeclarationFacts(): number {
  return useGroveStore(
    (state) => Object.keys(state.pendingShowDeclarationFacts).length,
  );
}
