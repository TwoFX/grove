import { promises as fs } from "fs";
import {
  Node,
  Section,
  NodeSection,
  Project,
  ShowDeclarationFact,
} from "@/lib/transfer/index";
import schema_project from "@/lib/transfer/project.jtd.json";
import Ajv from "ajv/dist/jtd";

export interface ProjectMetadata {
  hash: string;
  projectNamespace: string;
}

const serverDataFileLocation = process.env.GROVE_DATA_LOCATION;
if (!serverDataFileLocation) {
  throw new Error(
    "Location for std metadata file must be provided in env variable GROVE_DATA_LOCATION",
  );
}

const ajv = new Ajv();
const parseProject = ajv.compileParser<Project>(schema_project);

const serverData = await fs.readFile(serverDataFileLocation, "utf8");
const parsedProject = parseProject(serverData);
if (!parsedProject) {
  throw new Error("Invalid metadata: " + parseProject.message);
}
export const project: Project = parsedProject;
export const rootNode: Node = project.rootNode;
export const projectMetadata: ProjectMetadata = {
  hash: project.hash,
  projectNamespace: project.projectNamespace,
};

function createSectionMap(): Map<string, Section> {
  const sectionMap = new Map<string, Section>();

  function traverse(node: Node) {
    if (node.constructor === "section") {
      const section = (node as NodeSection).section;
      sectionMap.set(section.id, section);
      section.children.forEach(traverse);
    }
  }

  traverse(project.rootNode);

  return sectionMap;
}

export const sectionMap = createSectionMap();

export interface GroveContextData {
  showDeclarationFact: {
    [widgetId: string]: { [factId: string]: ShowDeclarationFact };
  };
}

function createShowDeclarationFactMap(): {
  [widgetId: string]: { [factId: string]: ShowDeclarationFact };
} {
  const showDeclarationMap: {
    [widgetId: string]: { [factId: string]: ShowDeclarationFact };
  } = {};

  function traverse(node: Node) {
    if (node.constructor === "section") {
      node.section.children.forEach(traverse);
    } else if (node.constructor === "showDeclaration") {
      const id = node.showDeclaration.definition.id;
      node.showDeclaration.facts.forEach((fact) => {
        const factId = fact.factId;
        if (!showDeclarationMap[id]) {
          showDeclarationMap[id] = {};
        }
        showDeclarationMap[id][factId] = fact;
      });
    }
  }

  traverse(project.rootNode);

  return showDeclarationMap;
}

export const groveContextData: GroveContextData = {
  showDeclarationFact: createShowDeclarationFactMap(),
};

// TODO: Access file containing invalidated fact ids, if present
