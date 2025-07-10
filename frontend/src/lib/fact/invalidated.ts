import { GroveContextData } from "../transfer/contextdata";
import { FactSummary } from "./summary";

export function isNewlyInvalidatedFact(
  context: GroveContextData,
  fact: FactSummary,
): boolean {
  if (context.upstreamInvalidatedFacts) {
    return context.upstreamInvalidatedFacts.has({
      factId: fact.factId,
      widgetId: fact.widgetId,
    });
  }
  return false;
}
