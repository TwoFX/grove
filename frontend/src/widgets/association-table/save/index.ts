import {
  AssociationTableDefinition,
  AssociationTableState,
} from "@/lib/transfer/project";
import {
  usePendingAssociationTableFact,
  usePendingAssociationTableState,
} from "../state/pending";
import { useContext } from "react";
import { GroveContext } from "@/lib/transfer/context";
import { GroveTemplateContext } from "@/lib/templates/context";

function getPossibleFactIds(state: AssociationTableState): string[] {
  return state.rows.map((row) => row.uuid);
}

export function emptyAssociationTableState(): AssociationTableState {
  return {
    rows: [],
  };
}

export function useRenderAssociationTable(): (
  associationTable: AssociationTableDefinition,
) => string {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);
  const getFact = usePendingAssociationTableFact();
  const getState = usePendingAssociationTableState();

  return (definition) => {
    const state = getState(definition.widgetId) ?? emptyAssociationTableState();

    const facts = getPossibleFactIds(state).flatMap((factId) => {
      const pendingFact = getFact(definition.widgetId, factId);
      if (pendingFact) {
        return [pendingFact];
      } else {
        return [];
      }
    });

    return templates.associationTable({
      state,
      metadata: context.projectMetadata,
      definition,
      facts,
    });
  };
}
