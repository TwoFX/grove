import { promises as fs } from "fs";
import {
  Node,
  Section,
  Project,
  ShowDeclarationFact,
} from "@/lib/transfer/project/index";
import schema_project from "@/lib/transfer/project/project.jtd.json";
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
const project: Project = parsedProject;
const rootNode: Node = project.rootNode;
const projectMetadata: ProjectMetadata = {
  hash: project.hash,
  projectNamespace: project.projectNamespace,
};

export interface GroveContextData {
  rootNode: Node;
  projectMetadata: ProjectMetadata;
  section: {
    [sectionId: string]: Section;
  };
  showDeclarationFact: {
    [widgetId: string]: { [factId: string]: ShowDeclarationFact };
  };
}

function createContextData(): GroveContextData {
  const contextData: GroveContextData = {
    rootNode: rootNode,
    projectMetadata: projectMetadata,
    section: {},
    showDeclarationFact: {},
  };

  function traverse(node: Node) {
    if (node.constructor === "section") {
      contextData.section[node.section.id] = node.section;
      node.section.children.forEach(traverse);
    } else if (node.constructor === "showDeclaration") {
      const id = node.showDeclaration.definition.id;
      node.showDeclaration.facts.forEach((fact) => {
        const factId = fact.factId;
        if (!contextData.showDeclarationFact[id]) {
          contextData.showDeclarationFact[id] = {};
        }
        contextData.showDeclarationFact[id][factId] = fact;
      });
    }
  }

  traverse(project.rootNode);

  return contextData;
}

export const groveContextData: GroveContextData = createContextData();

// TODO: Access file containing invalidated fact ids, if present
