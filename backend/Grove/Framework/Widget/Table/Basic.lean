/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Widget.Table.CellDataProvider
import Grove.Framework.Display
import Grove.Framework.Widget.AssociationTable.Basic

open Lean

namespace Grove.Framework.Widget

namespace Table

structure AssociationLayer (kind : DataKind) (β : Type) where
  layerIdentifier : β
  layerValue : kind.Key

structure Association (kind : DataKind) (β : Type) where
  id : String
  layers : Array (AssociationLayer kind β)

inductive AssociationSource (kind : DataKind) {β : Type} (layerIdentifiers : List β) where
  | table : Widget.AssociationTable kind layerIdentifiers → AssociationSource kind layerIdentifiers
  | const : MetaM (Array (Association kind β)) → AssociationSource kind layerIdentifiers

end Table

structure Table (rowKind columnKind cellKind : DataKind) {δ : Type} (layerIdentifiers : List δ) : Type where
  id : String
  rowsFrom : Table.AssociationSource rowKind layerIdentifiers
  columnsFrom : Table.AssociationSource columnKind layerIdentifiers
  cellData : Table.CellDataProvider rowKind columnKind cellKind layerIdentifiers

structure Table.Fact.SingleState (kind : DataKind) where
  value : String
  state : kind.State
deriving BEq

structure Table.Fact.LayerState (rowKind columnKind cellKind : DataKind) where
  layerIdentifier : String
  rowState : Option (SingleState rowKind)
  columnState : Option (SingleState columnKind)
  selectedCellStates : Array (SingleState cellKind)
deriving BEq

-- Selected cell options look good and are consistent
structure Table.Fact (rowKind columnKind cellKind : DataKind) where
  widgetId : String
  factId : String
  rowAssociationId : String
  columnAssociationId : String
  selectedLayers : Array String
  layerStates : Array (Table.Fact.LayerState rowKind columnKind cellKind)
  metadata : Fact.Metadata

structure Table.Data.SelectedCellOptions where
  layerIdentifier : String
  rowValue : String
  columnValue : String
  selectedCellOptions : Array String

structure Table.Data (rowKind columnKind cellKind : DataKind) where
  widgetId : String
  selectedRowAssociations : Array String
  selectedColumnAssociations : Array String
  selectedCellOptions : Array Table.Data.SelectedCellOptions
  selectedLayers : Array String
  facts : Array (Table.Fact rowKind columnKind cellKind)

end Grove.Framework.Widget
