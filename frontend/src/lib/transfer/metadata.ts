import { Declaration, Node, Project } from "@/lib/transfer/project/index";
import {
  addToFactRegistry,
  addToStateRegistry,
  emptyFactRegistry,
  emptyStateRegistry,
  GroveContextData,
  ProjectMetadata,
} from "./contextdata";
import { declarationName } from "./util";
import { InvalidatedFacts } from "./invalidated";

function collectDeclarations(decls: Declaration[]): {
  [key: string]: Declaration;
} {
  const result: { [key: string]: Declaration } = {};
  decls.forEach((decl) => {
    result[declarationName(decl)] = decl;
  });
  return result;
}

export function createContextData(
  project: Project,
  upstreamInvalidatedFacts: InvalidatedFacts | undefined,
): GroveContextData {
  const rootNode: Node = project.rootNode;
  const projectMetadata: ProjectMetadata = {
    hash: project.hash,
    projectNamespace: project.projectNamespace,
  };
  const contextData: GroveContextData = {
    declarations: collectDeclarations(project.declarations),
    upstreamInvalidatedFacts: upstreamInvalidatedFacts?.invalidatedFacts,
    upstreamNeedAttentionFacts: upstreamInvalidatedFacts?.needAttentionFacts,
    rootNode: rootNode,
    projectMetadata: projectMetadata,
    section: {},
    showDeclarationDefinition: emptyStateRegistry(),
    showDeclarationFact: emptyFactRegistry(),
    associationTableFact: emptyFactRegistry(),
    associationTableState: emptyStateRegistry(),
    associationTableDefinition: emptyStateRegistry(),
    assertionDefinition: emptyStateRegistry(),
    assertionFact: emptyFactRegistry(),
    tableFact: emptyFactRegistry(),
    tableState: emptyStateRegistry(),
    tableDefinition: emptyStateRegistry(),
    parentSection: {},
  };

  function traverse(node: Node, parent: string | undefined) {
    let id: string | undefined = undefined;
    if (node.constructor === "section") {
      id = node.section.id;
      contextData.section[node.section.id] = node.section;
      node.section.children.forEach((child) =>
        traverse(child, node.section.id),
      );
    } else if (node.constructor === "showDeclaration") {
      id = node.showDeclaration.definition.id;
      addToStateRegistry(
        contextData.showDeclarationDefinition,
        node.showDeclaration.definition.id,
        node.showDeclaration.definition,
      );
      node.showDeclaration.facts.forEach((fact) => {
        addToFactRegistry(
          contextData.showDeclarationFact,
          node.showDeclaration.definition.id,
          fact.factId,
          fact,
        );
      });
    } else if (node.constructor === "assertion") {
      id = node.assertion.definition.widgetId;
      addToStateRegistry(
        contextData.assertionDefinition,
        node.assertion.definition.widgetId,
        node.assertion.definition,
      );
      node.assertion.facts.forEach((fact) => {
        addToFactRegistry(
          contextData.assertionFact,
          node.assertion.definition.widgetId,
          fact.factId,
          fact,
        );
      });
    } else if (node.constructor === "associationTable") {
      id = node.associationTable.definition.widgetId;
      addToStateRegistry(
        contextData.associationTableDefinition,
        node.associationTable.definition.widgetId,
        node.associationTable.definition,
      );
      addToStateRegistry(
        contextData.associationTableState,
        node.associationTable.definition.widgetId,
        node.associationTable.state,
      );
      node.associationTable.facts.forEach((fact) => {
        addToFactRegistry(
          contextData.associationTableFact,
          node.associationTable.definition.widgetId,
          fact.factId,
          fact,
        );
      });
    } else if (node.constructor === "table") {
      id = node.table.definition.widgetId;
      addToStateRegistry(
        contextData.tableDefinition,
        node.table.definition.widgetId,
        node.table.definition,
      );
      addToStateRegistry(
        contextData.tableState,
        node.table.definition.widgetId,
        node.table.state,
      );
      node.table.facts.forEach((fact) => {
        addToFactRegistry(
          contextData.tableFact,
          node.table.definition.widgetId,
          fact.factId,
          fact,
        );
      });
    }
    if (id && parent) {
      contextData.parentSection[id] = parent;
    }
  }

  traverse(project.rootNode, undefined);

  return contextData;
}
