import { createContext, useContext } from "react";
import { useFactSummaries } from "../state/pending";
import {
  isNewlyInvalidatedFact,
  isNewlyNeedAttentionFact,
} from "../fact/invalidated";
import { GroveContext } from "../transfer/context";
import { InvalidatedFactsContext } from "../fact/invalidated/context";
import { FactStatus } from "../transfer/project";

export interface InvalidatedFactCounts {
  newlyInvalidatedFacts: number;
  invalidatedFacts: number;
  newlyNeedAttentionFacts: number;
  needsAttentionFacts: number;
  badFacts: number;
  postponedFacts: number;
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
    const isInvalidated = fact.validationResult.constructor === "invalidated";
    const isBad = fact.metadata.status === FactStatus.Bad;
    const isPostponed = fact.metadata.status === FactStatus.Postponed;
    const isNeedsAttention = fact.metadata.status === FactStatus.NeedsAttention;

    if (!isInvalidated && !isBad && !isPostponed && !isNeedsAttention) {
      continue;
    }

    const newlyInvalidated =
      isInvalidated &&
      isNewlyInvalidatedFact(
        invalidated,
        fact.widgetId,
        fact.factId,
        fact.validationResult,
      );

    const newlyNeedsAttention =
      isNeedsAttention &&
      isNewlyNeedAttentionFact(
        invalidated,
        fact.widgetId,
        fact.factId,
        fact.metadata.status,
      );

    let section: string | undefined = fact.widgetId;
    while (section) {
      if (!result.factCount[section]) {
        result.factCount[section] = {
          invalidatedFacts: 0,
          newlyInvalidatedFacts: 0,
          newlyNeedAttentionFacts: 0,
          needsAttentionFacts: 0,
          badFacts: 0,
          postponedFacts: 0,
        };
      }

      if (newlyInvalidated) {
        result.factCount[section].newlyInvalidatedFacts += 1;
      } else if (isInvalidated) {
        result.factCount[section].invalidatedFacts += 1;
      }

      if (newlyNeedsAttention) {
        result.factCount[section].newlyNeedAttentionFacts += 1;
      } else if (isNeedsAttention) {
        result.factCount[section].needsAttentionFacts += 1;
      }

      if (isBad) {
        result.factCount[section].badFacts += 1;
      }

      if (isPostponed) {
        result.factCount[section].postponedFacts += 1;
      }

      section = context.parentSection[section];
    }
  }

  return result;
}

export const FactCountContext = createContext<FactCountContextData>({
  factCount: {},
});
