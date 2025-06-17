/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Widget.Table.CellDataProvider
import Grove.Framework.Display
import Grove.Framework.Widget.AssociationTable.Basic

open Lean

namespace Grove.Framework

-- inductive AssociationSource (α : Type) {β : Type} (layerIdentifiers : List β) where
--   | table : Widget.AssociationTable α layerIdentifiers → AssociationSource α layerIdentifiers
--   | const : MetaM (Array (Vector α layerIdentifiers.length)) → AssociationSource α layerIdentifiers

namespace Widget

-- structure Table (α β γ : Type) {δ : Type} [DisplayShort δ] (layerIdentifiers : List δ) : Type where
--   id : String
--   rowsFrom : AssociationSource α layerIdentifiers
--   columnsFrom : AssociationSource β layerIdentifiers
--   cellData : Table.CellDataProvider α β γ layerIdentifiers

end Widget

end Grove.Framework
