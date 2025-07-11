import { GroveContextData } from "../transfer/contextdata";

export function isNewlyInvalidatedFact(
  context: GroveContextData,
  factId: string,
  widgetId: string,
): boolean {
  if (context.upstreamInvalidatedFacts) {
    return context.upstreamInvalidatedFacts.has({
      factId,
      widgetId,
    });
  }
  return false;
}
