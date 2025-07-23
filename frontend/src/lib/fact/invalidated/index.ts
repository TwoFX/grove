import { FactValidationResult } from "@/lib/transfer/project";
import { InvalidatedFactSet, makeInvalidatedFact } from "./context";

export function isNewlyInvalidatedFact(
  context: InvalidatedFactSet,
  widgetId: string,
  factId: string,
  validationResult: FactValidationResult,
): boolean {
  if (validationResult.constructor !== "invalidated") {
    return false;
  }
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
