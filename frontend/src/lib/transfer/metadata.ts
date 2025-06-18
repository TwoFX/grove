import { Declaration, Node, Project } from "@/lib/transfer/project/index";
import schema_project from "@/lib/transfer/project/project.jtd.json";
import schema_invalidatedFacts from "@/lib/transfer/invalidated/invalidatedFacts.jtd.json";
import Ajv from "ajv/dist/jtd";
import { InvalidatedFacts } from "./invalidated";
import { readFileSync } from "fs";
import {
  addToRegistry,
  emptyRegistry,
  GroveContextData,
  ProjectMetadata,
} from "./contextdata";
import { declarationName } from "./util";

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
    upstreamInvalidatedFacts,
    rootNode: rootNode,
    projectMetadata: projectMetadata,
    section: {},
    showDeclarationFact: emptyRegistry(),
  };

  function traverse(node: Node) {
    if (node.constructor === "section") {
      contextData.section[node.section.id] = node.section;
      node.section.children.forEach(traverse);
    } else if (node.constructor === "showDeclaration") {
      const id = node.showDeclaration.definition.id;
      node.showDeclaration.facts.forEach((fact) => {
        const factId = fact.factId;
        addToRegistry(contextData.showDeclarationFact, id, factId, fact);
      });
    }
  }

  traverse(project.rootNode);

  return contextData;
}

export const groveContextData: GroveContextData = createContextData();
