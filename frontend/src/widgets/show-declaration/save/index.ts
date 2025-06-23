import { ShowDeclarationDefinition } from "@/lib/transfer/project";
import { usePendingShowDeclarationFact } from "../state/pending";
import { useContext } from "react";
import { GroveContext } from "@/lib/transfer/context";
import { GroveTemplateContext } from "@/lib/templates/context";

function getPossibleFactIds(): string[] {
  return ["0"];
}

export function useRenderShowDeclaration(): (
  definition: ShowDeclarationDefinition,
) => string {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);
  const getFact = usePendingShowDeclarationFact();

  return (definition) => {
    const facts = getPossibleFactIds().flatMap((factId) => {
      const pendingFact = getFact(definition.id, factId);
      if (pendingFact) {
        return [pendingFact];
      } else {
        return [];
      }
    });

    return templates.showDeclaration({
      state: undefined,
      metadata: context.projectMetadata,
      definition,
      facts,
    });
  };
}
