import { createContext, useContext } from "react";
import { useFactSummaries } from "../state/pending";
import { isNewlyInvalidatedFact } from "../fact/invalidated";
import { GroveContext } from "../transfer/context";
import { InvalidatedFactsContext } from "../fact/invalidated/context";

export interface InvalidatedFactCounts {
  newlyInvalidatedFacts: number;
  invalidatedFacts: number;
}

export interface FactCountContextData {
  factCount: { [sectionId: string]: InvalidatedFactCounts };
}

export function useComputeFactCounts(): FactCountContextData {
  const context = useContext(GroveContext);
  const invalidated = useContext(InvalidatedFactsContext);
  const factSummaries = useFactSummaries();

  const result: FactCountContextData = { factCount: {} };

  for (const fact of factSummaries) {
    if (fact.validationResult.constructor !== "invalidated") {
      continue;
    }
    const newlyInvalidated = isNewlyInvalidatedFact(
      invalidated,
      fact.widgetId,
      fact.factId,
      fact.validationResult,
    );

    let section: string | undefined = fact.widgetId;
    while (section) {
      if (newlyInvalidated) {
        if (result.factCount[section]) {
          result.factCount[section].newlyInvalidatedFacts += 1;
        } else {
          result.factCount[section] = {
            invalidatedFacts: 0,
            newlyInvalidatedFacts: 1,
          };
        }
      } else {
        if (result.factCount[section]) {
          result.factCount[section].invalidatedFacts += 1;
        } else {
          result.factCount[section] = {
            invalidatedFacts: 1,
            newlyInvalidatedFacts: 0,
          };
        }
      }
      section = context.parentSection[section];
    }
  }

  return result;
}

export const FactCountContext = createContext<FactCountContextData>({
  factCount: {},
});
