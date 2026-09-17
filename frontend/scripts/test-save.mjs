import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";
import Ajv from "ajv/dist/jtd.js";
import ts from "typescript";

// Exercise the production serializers, templates, and File System Access writes together.
const output = process.argv[2];
assert.ok(
  output,
  "Pass a temporary fixture directory (see scripts/test-json-state.sh)",
);
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
assert.equal(config.error, undefined);
const parsedConfig = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  process.cwd(),
);
const program = ts.createProgram(["scripts/test-snapshot-types.ts"], {
  ...parsedConfig.options,
  incremental: false,
});
const diagnostics = [
  ...parsedConfig.errors,
  ...ts.getPreEmitDiagnostics(program),
];
assert.equal(
  diagnostics.length,
  0,
  ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (name) => name,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => "\n",
  }),
);
const server = await createServer({
  configFile: false,
  resolve: { alias: { "@": path.resolve("src") } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false, ws: false },
});
try {
  const { saveFiles } = await server.ssrLoadModule("/src/lib/save/files.ts");
  const json = await server.ssrLoadModule("/src/lib/save/json.ts");
  const { setupTemplates } = await server.ssrLoadModule(
    "/src/lib/templates/client.ts",
  );
  const { templates: strings } = await server.ssrLoadModule(
    "/src/lib/templates/strings.ts",
  );
  const { declarationStateJson } = await server.ssrLoadModule(
    "/src/lib/transfer/util.ts",
  );
  const templates = setupTemplates(strings);
  const metadata = { projectNamespace: "Test" };
  const comment = 'Quotes " and backslashes \\; Unicode α → β\nSecond line';
  const declaration = {
    constructor: "thm",
    thm: {
      name: "Old.name",
      renderedStatement: comment,
      isSimp: true,
      isDeprecated: false,
    },
  };
  const subexpression = declarationStateJson(declaration, "subexpression");
  const fact = {
    widgetId: "table",
    factId: "fact",
    metadata: { status: "done", comment },
    validationResult: { constructor: "new" },
    identifier: {
      rowAssociationId: "row",
      columnAssociationId: "column",
      selectedLayers: ["layer"],
    },
    state: {
      layerStates: [
        {
          layerIdentifier: "layer",
          rowState: {
            constructor: "some",
            some: {
              value: "Old.name",
              stateJson: declarationStateJson(declaration, "declaration"),
            },
          },
          columnState: {
            constructor: "some",
            some: { value: "Old.name", stateJson: subexpression },
          },
          selectedCellStates: [
            {
              value: "success",
              stateJson: {
                constructor: "synthesisSuccess",
                synthesisSuccess: {
                  head: "inst",
                  term: comment,
                  usedInstances: ["inst"],
                },
              },
            },
            {
              value: "failure",
              stateJson: { constructor: "synthesisFailure" },
            },
          ],
        },
        {
          layerIdentifier: "empty",
          rowState: { constructor: "none" },
          columnState: { constructor: "none" },
          selectedCellStates: [],
        },
      ],
    },
  };
  const tableState = {
    selectedRowAssociations: ["row"],
    selectedColumnAssociations: ["column"],
    selectedLayers: ["layer"],
    selectedCellOptions: Array.from({ length: 10000 }, (_, i) => ({
      layerIdentifier: "layer",
      rowValue: `row${i}`,
      columnValue: "column",
      selectedCellOptions: ["Old.name"],
    })),
  };
  const associationState = {
    rows: [
      {
        uuid: "row",
        title: comment,
        columns: [{ columnIdentifier: "col", cellValue: "Old.name" }],
      },
    ],
  };
  const associationFact = {
    ...fact,
    widgetId: "association",
    rowId: "row",
    state: [
      {
        columnIdentifier: "decl",
        cellValue: "Old.name",
        stateJson: subexpression,
      },
      {
        columnIdentifier: "pred",
        cellValue: "predicate",
        stateJson: {
          constructor: "subexpressionPredicate",
          subexpressionPredicate: { key: "predicate", displayShort: comment },
        },
      },
    ],
  };
  const assertionFacts = [
    "done",
    "nothingToDo",
    "believedGood",
    "postponed",
    "bad",
    "needsAttention",
  ].map((status) => ({
    ...fact,
    widgetId: "assertion",
    assertionId: status,
    factId: status,
    metadata: { status, comment },
    state: {
      assertionId: status,
      description: comment,
      passed: status === "done",
      message: "result",
    },
  }));
  const showFacts = [
    declaration,
    { constructor: "missing", missing: "Missing.name" },
    {
      constructor: "def",
      def: {
        name: "Example.definition",
        renderedStatement: comment,
        isDeprecated: true,
      },
    },
  ].map((state, i) => ({
    ...fact,
    widgetId: "show",
    factId: String(i),
    state,
  }));
  const payloads = {
    table: json.tableData("table", tableState, [fact]),
    association: json.associationTableData("association", associationState, [
      associationFact,
    ]),
    assertion: json.assertionData("assertion", assertionFacts),
    show: json.showDeclarationData("show", showFacts),
  };
  const projectSchema = JSON.parse(
    await readFile("src/lib/transfer/project/project.jtd.json", "utf8"),
  );
  const validateSnapshot = new Ajv().compile({
    ref: "stateSnapshot",
    definitions: projectSchema.definitions,
  });
  const layer = fact.state.layerStates[0];
  for (const snapshot of [
    layer.rowState.some.stateJson,
    layer.columnState.some.stateJson,
    ...layer.selectedCellStates.map((cell) => cell.stateJson),
    ...associationFact.state.map((cell) => cell.stateJson),
    ...showFacts.map((fact) => declarationStateJson(fact.state, "declaration")),
  ]) {
    assert.ok(
      validateSnapshot(snapshot),
      JSON.stringify(validateSnapshot.errors),
    );
  }
  for (const invalid of [
    {},
    null,
    "Lean source",
    { constructor: "declaration" },
    {
      constructor: "subexpressionPredicate",
      subexpressionPredicate: { key: 42, displayShort: "invalid" },
    },
    { constructor: "synthesisSuccess", synthesisSuccess: {} },
  ]) {
    assert.equal(validateSnapshot(invalid), false);
  }
  assert.equal(payloads.table.facts[0].layerStates[1].rowState, null);
  assert.ok(!("validationResult" in payloads.table.facts[0]));
  assert.throws(
    () =>
      json.associationTableData("old", associationState, [
        {
          ...associationFact,
          state: [
            {
              columnIdentifier: "col",
              cellValue: "value",
              stateRepr: "old Lean source",
            },
          ],
        },
      ]),
    /Reassert/,
  );
  assert.throws(
    () =>
      json.associationTableData("old", associationState, [
        {
          ...associationFact,
          state: [
            { columnIdentifier: "col", cellValue: "value", stateJson: {} },
          ],
        },
      ]),
    /Reassert/,
  );

  const files = new Map();
  function directory(prefix = "") {
    return {
      async getDirectoryHandle(name) {
        return directory(prefix + name + "/");
      },
      async getFileHandle(name) {
        return {
          async createWritable() {
            let contents;
            return {
              async write(value) {
                contents = value;
              },
              async close() {
                files.set(prefix + name, contents);
              },
            };
          },
        };
      },
    };
  }
  globalThis.window = { showDirectoryPicker: async () => directory() };
  const widget = (kind, definition) => ({
    constructor: kind,
    [kind]: { definition },
  });
  const root = {
    constructor: "section",
    section: {
      children: [
        widget("table", {
          widgetId: "table",
          rowKind: "declaration",
          columnKind: "subexpression",
          cellKind: "synthesis",
        }),
        {
          constructor: "section",
          section: {
            children: [
              widget("associationTable", {
                widgetId: "association",
                dataKind: "subexpression",
              }),
              widget("assertion", { widgetId: "assertion" }),
              widget("showDeclaration", { id: "show" }),
            ],
          },
        },
        { constructor: "namespace", namespace: "Ignored" },
        { constructor: "text", text: { id: "ignored", content: "text" } },
      ],
    },
  };
  const render = (template, id) => (definition) =>
    json.renderWidget(
      templates[template]({ metadata, definition }),
      payloads[id],
    );
  await saveFiles(root, {
    renderTable: render("table", "table"),
    renderAssociationTable: render("associationTable", "association"),
    renderAssertion: render("assertion", "assertion"),
    renderShowDeclaration: render("showDeclaration", "show"),
    renderGeneratedFile: (ids) => templates.generatedFile({ metadata, ids }),
  });
  assert.equal(files.size, 9);
  for (const [id, payload] of Object.entries(payloads)) {
    assert.deepEqual(JSON.parse(files.get(`Generated/${id}.json`)), payload);
    assert.ok(files.get(`Generated/${id}.lean`).length < 1000);
    assert.ok(!files.get(`Generated/${id}.lean`).includes(comment));
    assert.ok(files.get("Generated.lean").includes(`«${id}».restoreState`));
  }
  for (const [name, contents] of files) {
    const target = path.join(output, "Test", name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  await writeFile(
    path.join(output, "Empty.lean"),
    templates.generatedFile({
      metadata: { projectNamespace: "Empty" },
      ids: [],
    }),
  );
  console.log(
    "Frontend save tests passed (four widget types, 10,000 selections).",
  );
} finally {
  await server.close();
}
