import { promises as fs } from "fs";
import { Node, Section, NodeSection, Project } from "@/transfer/index";
import schema_project from "@/transfer/project.jtd.json";
import Ajv from "ajv/dist/jtd";

export interface ProjectMetadata {
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

// TODO: Access file containing invalidated fact ids, if present
