// Validates the Grove data files against the JTD schemas, replacing the
// build-time validation that lived in src/lib/transfer/server.ts before the
// migration to Vite. Run from the frontend directory: npm run validate-data
import Ajv from "ajv/dist/jtd.js";
import { existsSync, readFileSync } from "node:fs";

const projectSchema = JSON.parse(
  readFileSync("src/lib/transfer/project/project.jtd.json", "utf8"),
);
const invalidatedFactsSchema = JSON.parse(
  readFileSync(
    "src/lib/transfer/invalidated/invalidatedFacts.jtd.json",
    "utf8",
  ),
);

const ajv = new Ajv();

function validate(label, schema, location) {
  const parse = ajv.compileParser(schema);
  const result = parse(readFileSync(location, "utf8"));
  if (result === undefined) {
    console.error(
      `Invalid ${label} at ${location}:${parse.position}: ${parse.message}`,
    );
    process.exit(1);
  }
  console.log(`${label} at ${location} is valid`);
}

const projectLocation =
  process.env.GROVE_DATA_LOCATION ?? "public/metadata.json";
validate("project metadata", projectSchema, projectLocation);

const invalidatedLocation =
  process.env.GROVE_UPSTREAM_INVALIDATED_FACTS_LOCATION ??
  "public/invalidated.json";
if (existsSync(invalidatedLocation)) {
  validate("invalidated facts", invalidatedFactsSchema, invalidatedLocation);
} else {
  console.log(`No invalidated facts file at ${invalidatedLocation}, skipping`);
}
