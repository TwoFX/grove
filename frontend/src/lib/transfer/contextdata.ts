import { InvalidatedFacts } from "./invalidated";
import { Section, ShowDeclarationFact } from "./project";
import { Node } from "@/lib/transfer/project/index";

export interface FactRegistry<T> {
  byId: { [widgetId: string]: { [factId: string]: T } };
  all: T[];
}

export function emptyRegistry<T>(): FactRegistry<T> {
  return {
    byId: {},
    all: [],
  };
}

export function addToRegistry<T>(
  reg: FactRegistry<T>,
  widgetId: string,
  factId: string,
  fact: T,
) {
  if (!reg.byId[widgetId]) {
    reg.byId[widgetId] = {};
  }
  reg.byId[widgetId][factId] = fact;
  reg.all.push(fact);
}

export interface ProjectMetadata {
  hash: string;
  projectNamespace: string;
}

export interface GroveContextData {
  upstreamInvalidatedFacts: InvalidatedFacts | undefined;
  rootNode: Node;
  projectMetadata: ProjectMetadata;
  section: {
    [sectionId: string]: Section;
  };
  showDeclarationFact: FactRegistry<ShowDeclarationFact>;
}
