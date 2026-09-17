/-
Copyright (c) 2026 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
-/
module

public import Grove.Framework.Widget.State
public meta import Lean.Elab.Term

open Lean

namespace Grove.Framework

/-- The JSON sibling of this Lean source file. Resolve the source path at build time so restoring
state does not depend on the working directory of the backend process. Only the path is compiled
into the generated module; the contents are read each time state is restored. -/
elab "savedStateFile%" : term => do
  let path ← IO.FS.realPath (← Lean.MonadLog.getFileName)
  return mkStrLit (path.withExtension "json").toString

/-- Read and decode saved state, reporting the source file on both IO and decoding errors. -/
public def readSavedState [FromJson α] (path : System.FilePath) : RestoreStateM α := do
  let contents ← try IO.FS.readFile path catch e =>
    throw <| IO.userError s!"Cannot read Grove state from {path}: {e}"
  match Json.parse contents >>= fromJson? with
  | .ok value => return value
  | .error message => throw <| IO.userError s!"Invalid Grove state in {path}: {message}"

public structure Widget.ShowDeclaration.Data where
  facts : Array Widget.ShowDeclaration.Fact
deriving ToJson, FromJson

public def Widget.Table.load (rowKind columnKind cellKind : DataKind) (path : System.FilePath) :
    RestoreStateM (Widget.Table.Data rowKind columnKind cellKind) := do
  let table : Widget.Table.Data rowKind columnKind cellKind ← readSavedState path
  let selectedCellOptions ← table.selectedCellOptions.mapM fun cell => do
    return { cell with selectedCellOptions := ← cell.selectedCellOptions.mapM migrateName }
  return { table with selectedCellOptions }

public def Widget.AssociationTable.load (kind : DataKind) (path : System.FilePath) :
    RestoreStateM (Widget.AssociationTable.Data kind) := do
  let table : Widget.AssociationTable.Data kind ← readSavedState path
  let rows ← table.rows.mapM fun row => do
    let columns ← row.columns.mapM fun cell => do
      return { cell with cellValue := ← migrateName cell.cellValue }
    return { row with columns }
  return { table with rows }

end Grove.Framework
