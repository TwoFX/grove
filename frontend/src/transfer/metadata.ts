import { promises as fs } from "fs";
import { Node, Section, NodeSection } from "@/transfer/index";
import schema_node from "@/schemas/node.jtd.json";
import Ajv from "ajv/dist/jtd";

const serverDataFileLocation = process.env.STD_METADATA_LOCATION;
if (!serverDataFileLocation) {
  throw new Error(
    "Location for std metadata file must be provided in env variable STD_METADATA_LOCATION",
  );
}

const ajv = new Ajv();
const parseNode = ajv.compileParser<Node>(schema_node);

const serverData = await fs.readFile(serverDataFileLocation, "utf8");
const parsedNode = parseNode(serverData);
if (!parsedNode) {
  throw new Error("Invalid metadata");
}
export const rootNode: Node = parsedNode;

function createSectionMap(): Map<string, Section> {
  const sectionMap = new Map<string, Section>();

  function traverse(node: Node) {
    if (node.constructor === "section") {
      const section = (node as NodeSection).section;
      sectionMap.set(section.id, section);
      section.children.forEach(traverse);
    }
  }

  if (rootNode) {
    traverse(rootNode);
  }

  return sectionMap;
}

export const sectionMap = createSectionMap();

export function nodeKey(node: Node): string {
  switch (node.constructor) {
    case "assertion":
      return node.assertion.id;
    case "namespace":
      return node.namespace; //  TODO
    case "section":
      return node.section.id;
    case "showDeclaration":
      return node.showDeclaration.id;
    case "text":
      return node.text; // TODO
  }
}

// TODO: Access file containing invalidated fact ids, if present
