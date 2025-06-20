import {
  AssociationTableDefinition,
  AssociationTableState,
} from "@/lib/transfer/project";
import {
  usePendingAssociationTableFact,
  usePendingAssociationTableState,
} from "../state/pending";
import { ProjectMetadata } from "@/lib/transfer/contextdata";
import { Templates } from "@/lib/templates";

function getPossibleFactIds(state: AssociationTableState): string[] {
  return state.rows.map((row) => row.uuid);
}

export function emptyAssociationTableState(): AssociationTableState {
  return {
    rows: [],
  };
}

export function useRenderAssociationTable(
  metadata: ProjectMetadata,
  templates: Templates,
): (associationTable: AssociationTableDefinition) => string {
  const getFact = usePendingAssociationTableFact();
  const getState = usePendingAssociationTableState();

  return (definition) => {
    const state = getState(definition.widgetId) ?? emptyAssociationTableState();

    console.log("have state: " + JSON.stringify(state));

    const facts = getPossibleFactIds(state).flatMap((factId) => {
      console.log("have potential fact: " + factId);
      const pendingFact = getFact(definition.widgetId, factId);
      if (pendingFact) {
        console.log("have fact: " + JSON.stringify(pendingFact));
        return [pendingFact];
      } else {
        return [];
      }
    });

    return templates.associationTable({
      state,
      metadata,
      definition,
      facts,
    });
  };
}
