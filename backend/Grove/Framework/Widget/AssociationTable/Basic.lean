/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.DataSource.Basic

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
structure AssociationTable (α : Type) {β : Type} (columnIdentifiers : List β) : Type where
  id : String
  dataSources : β → DataSource α

structure AssociationTable.Data where
  columns : Array (Array (String))

structure AssociationTable.Fact where
  

end Grove.Framework.Widget
