import { RenderedWidget, renderWidget, assertionData } from "@/lib/save/json";
import { useContext } from "react";
import { GroveContext } from "@/lib/transfer/context";
import { GroveTemplateContext } from "@/lib/templates/context";
import { AssertionDefinition } from "@/lib/transfer/project";
import { usePendingAssertionFact } from "../state/pending";

function getPossibleFactIds(state: AssertionDefinition): string[] {
  return state.results.map((result) => result.assertionId);
}

export function useRenderAssertion(): (
  assertion: AssertionDefinition,
) => RenderedWidget {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);
  const getFact = usePendingAssertionFact();

  return (definition) => {
    const facts = getPossibleFactIds(definition).flatMap((factId) => {
      const pendingFact = getFact(definition.widgetId, factId);
      if (pendingFact) {
        return [pendingFact];
      } else {
        return [];
      }
    });

    return renderWidget(
      templates.assertion({ metadata: context.projectMetadata, definition }),
      assertionData(definition.widgetId, facts),
    );
  };
}
