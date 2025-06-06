import { promises as fs } from "fs";
import { Node, Section, NodeSection } from "@/transfer/index";
import schema_node from "@/transfer/node.jtd.json";
import Ajv from "ajv/dist/jtd";

const serverDataFileLocation = process.env.GROVE_DATA_LOCATION;
if (!serverDataFileLocation) {
  throw new Error(
    "Location for std metadata file must be provided in env variable GROVE_DATA_LOCATION",
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

// TODO: Access file containing invalidated fact ids, if present
