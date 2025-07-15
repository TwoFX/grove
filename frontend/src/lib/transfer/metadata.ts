import { Declaration, Node, Project } from "@/lib/transfer/project/index";
import schema_project from "@/lib/transfer/project/project.jtd.json";
import schema_invalidatedFacts from "@/lib/transfer/invalidated/invalidatedFacts.jtd.json";
import Ajv from "ajv/dist/jtd";
import { InvalidatedFacts } from "./invalidated";
import { readFileSync } from "fs";
import {
  addToFactRegistry,
  addToStateRegistry,
  emptyFactRegistry,
  emptyStateRegistry,
  GroveContextData,
  ProjectMetadata,
} from "./contextdata";
import { declarationName } from "./util";
import { Set } from "immutable";

const serverDataFileLocation = process.env.GROVE_DATA_LOCATION;
if (!serverDataFileLocation) {
  throw new Error(
    "Location for std metadata file must be provided in env variable GROVE_DATA_LOCATION",
  );
}

const ajv = new Ajv();
const parseProject = ajv.compileParser<Project>(schema_project);
const parseInvalidatedFacts = ajv.compileParser<InvalidatedFacts>(
  schema_invalidatedFacts,
);

const serverData = readFileSync(serverDataFileLocation, "utf8");
const parsedProject = parseProject(serverData);
if (!parsedProject) {
  throw new Error(
    "Invalid metadata at " +
      parseProject.position +
      ": " +
      parseProject.message,
  );
}

let upstreamInvalidatedFacts: InvalidatedFacts | undefined = undefined;

const upstreamInvalidatedFactsLocation =
  process.env.GROVE_UPSTREAM_INVALIDATED_FACTS_LOCATION;
if (upstreamInvalidatedFactsLocation) {
  const invalidatedFactsData = readFileSync(
    upstreamInvalidatedFactsLocation,
    "utf8",
  );
  const parsedInvalidatedFacts = parseInvalidatedFacts(invalidatedFactsData);
  if (!parsedInvalidatedFacts) {
    throw new Error(
      "Invalid invalidated facts: " + parseInvalidatedFacts.message,
    );
  }
  upstreamInvalidatedFacts = parsedInvalidatedFacts;
}

const project: Project = parsedProject;
const rootNode: Node = project.rootNode;
const projectMetadata: ProjectMetadata = {
  hash: project.hash,
  projectNamespace: project.projectNamespace,
};

function collectDeclarations(decls: Declaration[]): {
  [key: string]: Declaration;
} {
  const result: { [key: string]: Declaration } = {};
  decls.forEach((decl) => {
    result[declarationName(decl)] = decl;
  });
  return result;
}

function createContextData(): GroveContextData {
  const contextData: GroveContextData = {
    declarations: collectDeclarations(project.declarations),
    upstreamInvalidatedFacts: upstreamInvalidatedFacts?.invalidatedFacts,
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

export const groveContextData: GroveContextData = createContextData();
