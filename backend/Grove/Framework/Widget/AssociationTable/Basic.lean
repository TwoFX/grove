/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.DataSource.Basic
public import Grove.Framework.Fact

namespace Grove.Framework.Widget

/--
In an association table, there is a set of options for every column, and every row associates a
choice from each set with each other.

For example, there could be an association table "map-like operations for container types". The
columns are `List`, `Array`, `Vector`, and so on; the data sources map each namespace to the set of
definitions in that namespace, and there are rows like `(List.map, Array.map, ...)` and
`(List.flatMap, Array.flatMap, ...)`.
-/
-- TODO: assume things about α and β to give them identity.
public structure AssociationTable (cellKind : DataKind) {β : Type} (columnIdentifiers : List β) : Type where
  id : String
  title : String
  description : String := ""
  unassertedFactMode : UnassertedFactMode := .doNothing
  dataSources : β → DataSource cellKind

public structure AssociationTable.Data.Cell where
  columnIdentifier : String
  cellValue : String

public structure AssociationTable.Data.Row where
  uuid : String
  title : String
  columns : Array AssociationTable.Data.Cell

public structure AssociationTable.Fact.CellState (cellKind : DataKind) where
  columnIdentifier : String
  cellValue : String
  cellState : cellKind.State
deriving BEq

-- Row looks good (AD-4/AD-8)
public structure AssociationTable.Fact (cellKind : DataKind) where
  widgetId : String
  factId : String
  rowId : String
  rowState : Array (AssociationTable.Fact.CellState cellKind)
  metadata : Fact.Metadata

public structure AssociationTable.Data (cellKind : DataKind) where
  widgetId : String
  rows : Array AssociationTable.Data.Row
  facts : Array (AssociationTable.Fact cellKind)

end Grove.Framework.Widget
