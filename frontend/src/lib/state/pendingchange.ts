import { WidgetRouteKind, widgetUrl } from "../navigate/urls";
import { StateRegistry } from "../transfer/contextdata";
import { GroveState } from "./state";

export interface PendingChange {
  displayShort: string;
  href: string | undefined;
  id: string;
  remove: (state: GroveState) => void;
}

export function collectPendingFactChanges<TDefinition, TFact>(
  pendingFacts: {
    [widgetId: string]: { [factId: string]: TFact };
  },
  definitions: StateRegistry<TDefinition>,
  getTitle: (def: TDefinition) => string,
  route: WidgetRouteKind | undefined,
  clearPendingFact: (state: GroveState, widgetId: string) => void,
): PendingChange[] {
  return Object.entries(pendingFacts).flatMap(
    ([widgetId, pendingForWidget]) => {
      const count = Object.keys(pendingForWidget).length;
      if (count === 0) {
        return [];
      } else {
        const def = definitions.byId[widgetId];
        const title = def ? getTitle(def) : "Unknown widget";
        return [
          {
            displayShort: `${title}: ${count} facts`,
            href: route ? widgetUrl(route, widgetId) : undefined,
            remove: (state) => clearPendingFact(state, widgetId),
            id: `${widgetId}-facts`,
          },
        ];
      }
    },
  );
}

export function collectPendingStateChanges<TDefinition, TState>(
  pendingStates: { [widgetId: string]: TState },
  definitions: StateRegistry<TDefinition>,
  getTitle: (def: TDefinition) => string,
  route: WidgetRouteKind | undefined,
  clearPendingState: (state: GroveState, widgetId: string) => void,
): PendingChange[] {
  return Object.keys(pendingStates).map((widgetId) => {
    const def = definitions.byId[widgetId];
    const title = def ? getTitle(def) : "Unknown widget";
    return {
      displayShort: `${title} changed`,
      href: route ? widgetUrl(route, widgetId) : undefined,
      remove: (state) => clearPendingState(state, widgetId),
      id: `${widgetId}-state`,
    };
  });
}

export function collectPendingFactAndStateChanges<TDefinition, TFact, TState>(
  pendingFacts: {
    [widgetId: string]: { [factId: string]: TFact };
  },
  pendingStates: { [widgetId: string]: TState },
  definitions: StateRegistry<TDefinition>,
  getTitle: (def: TDefinition) => string,
  route: WidgetRouteKind | undefined,
  clearPendingFact: (state: GroveState, widgetId: string) => void,
  clearPendingState: (state: GroveState, widgetId: string) => void,
): PendingChange[] {
  return [
    ...collectPendingFactChanges(
      pendingFacts,
      definitions,
      getTitle,
      route,
      clearPendingFact,
    ),
    ...collectPendingStateChanges(
      pendingStates,
      definitions,
      getTitle,
      route,
      clearPendingState,
    ),
  ];
}
