import { InvalidatedFactSet, makeInvalidatedFact } from "./context";

export function isNewlyInvalidatedFact(
  context: InvalidatedFactSet,
  widgetId: string,
  factId: string,
): boolean {
  if (context.upstreamInvalidatedFacts) {
    const result = context.upstreamInvalidatedFacts.has(
      makeInvalidatedFact({
        factId: factId,
        widgetId: widgetId,
      }),
    );
    return !result;
  }
  return false;
}
