import { deepEqual } from "fast-equals";
import { FactRegistry, StateRegistry } from "../transfer/contextdata";
import { castDraft, produce } from "immer";

export function updatePendingFacts<TFact>(
  fromContext: FactRegistry<TFact>,
  pending: { [widgetId: string]: { [factId: string]: TFact } },
  widgetId: string,
  factId: string,
  fact: TFact | undefined,
): { [widgetId: string]: { [factId: string]: TFact } } {
  if (!fact || deepEqual(fromContext?.byId[widgetId]?.[factId], fact)) {
    return produce(pending, (draft) => {
      if (draft[widgetId]) {
        delete draft[widgetId][factId];
      }
    });
  } else {
    return produce(pending, (draft) => {
      if (!draft[widgetId]) {
        draft[widgetId] = {};
      }
      draft[widgetId][factId] = castDraft(fact);
    });
  }
}

export function updatePendingState<TState>(
  fromContext: StateRegistry<TState>,
  pending: { [widgetId: string]: TState },
  widgetId: string,
  state: TState | undefined,
): { [widgetId: string]: TState } {
  if (!state || deepEqual(fromContext?.byId[widgetId], state)) {
    return produce(pending, (draft) => {
      delete draft[widgetId];
    });
  } else {
    return produce(pending, (draft) => {
      draft[widgetId] = castDraft(state);
    });
  }
}
