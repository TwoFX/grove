import { promises as fs } from 'fs';
import { Node } from '@/transfer/index'
import schema_node from '../schemas/node.jtd.json';
import Ajv from 'ajv/dist/jtd';

export default async function Home() {
  const serverDataFileLocation = process.env.STD_METADATA_LOCATION;
  if (!serverDataFileLocation) {
    throw new Error("Location for std metadata file must be provided in env variable STD_METADATA_LOCATION");
  }

  const ajv = new Ajv();
  const parseNode = ajv.compileParser<Node>(schema_node);

  const serverData = await fs.readFile(serverDataFileLocation, 'utf8');
  const rootNode: Node | undefined = parseNode(serverData);

  if (!rootNode) {
    throw new Error("Invalid std metadata file: " + parseNode.message);
  }

  // TODO: Access file containing invalidated fact ids, if present


  return (
    <p>Here be dragons: {JSON.stringify(rootNode)}</p>
  );
}
