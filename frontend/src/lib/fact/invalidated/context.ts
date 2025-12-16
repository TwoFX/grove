import { Record, RecordOf, Set } from "immutable";
import { createContext } from "react";

type InvalidatedFactProps = { factId: string; widgetId: string };

const defaultValues: InvalidatedFactProps = { factId: "", widgetId: "" };
export const makeInvalidatedFact: Record.Factory<InvalidatedFactProps> =
  Record(defaultValues);

export type InvalidatedFactRecord = RecordOf<InvalidatedFactProps>;

export interface InvalidatedFactSet {
  upstreamInvalidatedFacts: Set<InvalidatedFactRecord> | undefined;
  upstreamNeedAttentionFacts: Set<InvalidatedFactRecord> | undefined;
}

export const InvalidatedFactsContext = createContext<InvalidatedFactSet>({
  upstreamInvalidatedFacts: undefined,
  upstreamNeedAttentionFacts: undefined,
});
