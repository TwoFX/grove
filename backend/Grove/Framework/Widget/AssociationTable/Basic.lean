/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.DataSource.Basic

namespace Grove.Framework.Widget

/--
In an association table, every row
-/
structure AssociationTable (α : Type) {β : Type}
    (columnIdentifiers : List β) : Type where
  id : String
  dataSources : β → DataSource α

end Grove.Framework.Widget
