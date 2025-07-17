import { readFileSync } from "fs";
import { createContextData } from "./metadata";
import { GroveContextData } from "./contextdata";
import schema_project from "@/lib/transfer/project/project.jtd.json";
import schema_invalidatedFacts from "@/lib/transfer/invalidated/invalidatedFacts.jtd.json";
import Ajv from "ajv/dist/jtd";
import { Project } from "./project";
import { InvalidatedFacts } from "./invalidated";

const ajv = new Ajv();
const parseProject = ajv.compileParser<Project>(schema_project);
const parseInvalidatedFacts = ajv.compileParser<InvalidatedFacts>(
  schema_invalidatedFacts,
);

const serverDataFileLocation = process.env.GROVE_DATA_LOCATION;
if (!serverDataFileLocation) {
  throw new Error(
    "Location for std metadata file must be provided in env variable GROVE_DATA_LOCATION",
  );
}

const serverData = readFileSync(serverDataFileLocation, "utf8");
const project = parseProject(serverData);
if (!project) {
  throw new Error(
    "Invalid metadata at " +
      parseProject.position +
      ": " +
      parseProject.message,
  );
}

const upstreamInvalidatedFactsLocation =
  process.env.GROVE_UPSTREAM_INVALIDATED_FACTS_LOCATION;
let upstreamInvalidatedFacts: InvalidatedFacts | undefined = undefined;
if (upstreamInvalidatedFactsLocation) {
  const invalidatedFactsData = readFileSync(
    upstreamInvalidatedFactsLocation,
    "utf8",
  );
  upstreamInvalidatedFacts = parseInvalidatedFacts(invalidatedFactsData);
  if (!upstreamInvalidatedFacts) {
    throw new Error(
      "Invalid upstream invalidated facts at " +
        parseInvalidatedFacts.position +
        ": " +
        parseInvalidatedFacts.message,
    );
  }
}

export const serverContextData: GroveContextData = createContextData(
  project,
  upstreamInvalidatedFacts,
);
