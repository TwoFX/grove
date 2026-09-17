import Grove.Framework
import Test.Generated

open Lean Grove.Framework Widget

private def check (condition : Bool) (message : String) : IO Unit :=
  unless condition do throw <| IO.userError message

private def runRestore (action : RestoreStateM α) (renamings : Array (String × String) := #[]) : IO α := do
  return (← (StateT.run action {}).run { renamings := Std.HashMap.ofArray renamings }).1

private def checkPayload [ToJson α] (path : System.FilePath) (data : α) : IO Unit := do
  let expected ← IO.ofExcept <| Json.parse (← IO.FS.readFile path)
  check (toJson data == expected) s!"Payload changed during restore: {path}"

private def expectError (path : System.FilePath) : IO Unit := do
  let message ← try
    let _ ← runRestore (readSavedState (α := Assertion.Data) path)
    pure ""
  catch e => pure e.toString
  check (message.contains path.toString) s!"Missing error with filename for {path}"

def main (args : List String) : IO Unit := do
  let [dir] := args | throw <| IO.userError "Expected fixture directory"
  let dir := System.FilePath.mk dir / "Test" / "Generated"
  let table ← runRestore Test.Generated.«table».table
  checkPayload (dir / "table.json") table
  check (table.selectedCellOptions.size == 10000) "Large table was truncated"
  checkPayload (dir / "association.json") (← runRestore Test.Generated.«association».table)
  checkPayload (dir / "assertion.json") (← runRestore Test.Generated.«assertion».table)
  checkPayload (dir / "show.json") (ShowDeclaration.Data.mk (← runRestore Test.Generated.«show».facts))

  let migrated ← runRestore Test.Generated.«table».table #[("Old.name", "New.name")]
  check ((migrated.selectedCellOptions[0]?.map (·.selectedCellOptions)) == some #["New.name"])
    "Selection was not renamed"
  check (toJson migrated.facts == toJson table.facts) "Historical facts were renamed"
  let association ← runRestore Test.Generated.«association».table #[("Old.name", "New.name")]
  check ((association.rows[0]?.bind (·.columns[0]?) |>.map (·.cellValue)) == some "New.name")
    "Association cell was not renamed"
  check ((association.facts[0]?.bind (·.rowState[0]?) |>.map (·.cellValue)) == some "Old.name")
    "Historical association was renamed"

  let state ← Test.Generated.restoreState.run { renamings := ∅ }
  check (state.tables.size == 1 && state.associationTables.size == 1 &&
    state.assertions.size == 1 && state.showDeclarationFacts.size == 1) "Widgets were not registered"

  -- Changing only JSON must be visible without recompiling the generated Lean modules.
  let path := dir / "assertion.json"
  let original ← IO.FS.readFile path
  try
    IO.FS.writeFile path ((toJson ({ widgetId := "changed", facts := #[] } : Assertion.Data)).compress)
    check ((← runRestore Test.Generated.«assertion».table).widgetId == "changed") "JSON was embedded at compile time"
    IO.FS.writeFile path "{invalid"
    expectError path
    IO.FS.writeFile path "{}"
    expectError path
  finally
    IO.FS.writeFile path original
  expectError (dir / "missing.json")
  IO.println "Lean JSON restore tests passed."
