// Compile-only checks, run by test-save.mjs.
import type {
  StateSnapshot,
  TableFactSingleState,
} from "../src/lib/transfer/project";
import { renderWidget } from "../src/lib/save/json";

declare function expectSnapshot(snapshot: StateSnapshot): void;
declare const cell: TableFactSingleState;

expectSnapshot(cell.stateJson);
expectSnapshot({ constructor: "synthesisFailure" });
expectSnapshot({
  constructor: "declaration",
  declaration: { constructor: "missing", missing: "Example.name" },
});

if (cell.stateJson.constructor === "synthesisSuccess") {
  cell.stateJson.synthesisSuccess.usedInstances.map((name) =>
    name.toUpperCase(),
  );
}

// @ts-expect-error Arbitrary JSON is not a snapshot.
expectSnapshot({});
// @ts-expect-error Successful synthesis requires a result.
expectSnapshot({ constructor: "synthesisSuccess" });
expectSnapshot({
  constructor: "declaration",
  // @ts-expect-error The declaration payload must match its discriminator.
  declaration: { constructor: "missing", missing: 42 },
});
// @ts-expect-error Saved widgets must contain widget data.
renderWidget("", new Date());
