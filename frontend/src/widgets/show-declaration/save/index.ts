import { Templates } from "@/lib/templates";
import { ShowDeclarationDefinition } from "@/lib/transfer/project";
import { usePendingShowDeclarationFact } from "../state/pending";
import { ProjectMetadata } from "@/lib/transfer/contextdata";

function getPossibleFactIds(): string[] {
  return ["0"];
}

export function useRenderShowDeclaration(
  metadata: ProjectMetadata,
  templates: Templates,
): (definition: ShowDeclarationDefinition) => string {
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
      metadata,
      definition,
      facts,
    });
  };
}
