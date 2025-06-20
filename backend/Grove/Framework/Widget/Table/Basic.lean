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


namespace Widget

namespace Table

structure AssociationLayer (kind : DataKind) (β : Type) where
  layerIdentifier : β
  layerValue : kind.Key

inductive AssociationSource (kind : DataKind) {β : Type} (layerIdentifiers : List β) where
  | table : Widget.AssociationTable kind layerIdentifiers → AssociationSource kind layerIdentifiers
  | const : MetaM (Array (Array (AssociationLayer kind β))) → AssociationSource kind layerIdentifiers

end Table

structure Table (rowKind columnKind cellKind : DataKind) {δ : Type} (layerIdentifiers : List δ) : Type where
  id : String
  rowsFrom : Table.AssociationSource rowKind layerIdentifiers
  columnsFrom : Table.AssociationSource columnKind layerIdentifiers
  cellData : Table.CellDataProvider rowKind columnKind cellKind layerIdentifiers

end Widget

end Grove.Framework
