/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Backend.Data
import Grove.Framework.Backend.RenderM.RenderInfo
import Grove.Framework.Reference

namespace Grove.Framework.Backend.Full

open Widget JTD

namespace Data

structure Table.SelectedCellOptions where
  rowValue : String
  columnValue : String
  selectedCellOptions : Array String

instance : SchemaFor Table.SelectedCellOptions :=
  .structure "tableSelectedCellOptions"
    [.single "rowValue" Table.SelectedCellOptions.rowValue,
     .single "columnValue" Table.SelectedCellOptions.columnValue,
     .arr "selectedCellOptions" Table.SelectedCellOptions.selectedCellOptions]

structure Table.State where
  selectedRowAssociations : Array String
  selectedColumnAssociations : Array String
  selectedCellOptions : Array Table.SelectedCellOptions

instance schemaTableState : SchemaFor Table.State :=
  .structure "tableState"
    [.arr "selectedRowAssociations" Table.State.selectedRowAssociations,
     .arr "selectedColumnAssociations" Table.State.selectedColumnAssociations,
     .arr "selectedCellOptions" Table.State.selectedCellOptions]

structure Table.Fact.Identifier where
  rowAssociationId : String
  columnAssociationId : String
  selectedLayers : Array String

instance : SchemaFor Table.Fact.Identifier :=
  .structure "tableFactIdentifier"
    [.single "rowAssociationId" Table.Fact.Identifier.rowAssociationId,
     .single "columnAssociationId" Table.Fact.Identifier.columnAssociationId,
     .arr "selectedLayers" Table.Fact.Identifier.selectedLayers]

-- Can be row, column, or cell, for one layer.
structure Table.Fact.SingleState where
  value : String
  stateRepr : String

instance : SchemaFor Table.Fact.SingleState :=
  .structure "tableFactSingleState"
    [.single "value" Table.Fact.SingleState.value,
     .single "stateRepr" Table.Fact.SingleState.stateRepr]

structure Table.Fact.LayerState where
  layerIdentifier : String
  rowState : Table.Fact.SingleState
  columnState : Table.Fact.SingleState
  selectedCellStates : Array Table.Fact.SingleState

instance : SchemaFor Table.Fact.LayerState :=
  .structure "tableFactLayerState"
    [.single "layerIdentifier" Table.Fact.LayerState.layerIdentifier,
     .single "rowState" Table.Fact.LayerState.rowState,
     .single "columnState" Table.Fact.LayerState.columnState,
     .arr "selectedCellStates" Table.Fact.LayerState.selectedCellStates]

structure Table.Fact.State where
  layerStates : Array Table.Fact.LayerState

instance schemaTableFactState : SchemaFor Table.Fact.State :=
  .structure "tableFactState"
    [.arr "layerStates" Table.Fact.State.layerStates]

structure Table.Fact where
  widgetId : String
  factId : String
  identifier : Table.Fact.Identifier
  state : Table.Fact.State
  metadata : Fact.Metadata
  validationResult : Fact.ValidationResult

instance validatedFactTableFact : ValidatedFact Table.Fact where
  widgetId := Table.Fact.widgetId
  factId := Table.Fact.factId
  validationResult := Table.Fact.validationResult

instance schemaTableFact : SchemaFor Table.Fact :=
  .structure "tableFact"
    [.single "widgetId" Table.Fact.widgetId,
     .single "factId" Table.Fact.factId,
     .single "identifier" Table.Fact.identifier,
     .single "state" Table.Fact.state,
     .single "metadata" Table.Fact.metadata,
     .single "validationResult" Table.Fact.validationResult]

structure Table.AssociationLayer where
  layerIdentifier : String
  layerValue : String

instance : SchemaFor Table.AssociationLayer :=
  .structure "tableAssociationLayer"
    [.single "layerIdentifier" Table.AssociationLayer.layerIdentifier,
     .single "layerValue" Table.AssociationLayer.layerValue]

structure Table.Association where
  id : String
  layers : Array Table.AssociationLayer

instance : SchemaFor Table.Association :=
  .structure "tableAssociation"
    [.single "id" Table.Association.id,
     .arr "layers" Table.Association.layers]

structure Table.ConstantAssociationSource where
  associations : Array Table.Association

instance : SchemaFor Table.ConstantAssociationSource :=
  .structure "tableConstantAssociationSource"
    [.arr "associations" Table.ConstantAssociationSource.associations]

inductive Table.AssociationSource where
  | const : Table.ConstantAssociationSource → Table.AssociationSource
  | table : /- widgetId -/ String → Table.AssociationSource

instance : SchemaFor Table.AssociationSource :=
  .inductive "tableAssociationSource"
    [.unary "const" Table.ConstantAssociationSource (fun | .const t => some t | _ => none),
     .unary "table" String (fun | .table t => some t | _ => none)]

structure Table.CellOption.Other where
  value : String
  shortDescription : String
  longDescription : String
  reference : Reference
  stateRepr : String

instance schemaTableCellOptionOther : SchemaFor Table.CellOption.Other :=
  .structure "tableCellOptionOther"
    [.single "value" Table.CellOption.Other.value,
     .single "shortDescription" Table.CellOption.Other.shortDescription,
     .single "longDescription" Table.CellOption.Other.longDescription,
     .single "reference" Table.CellOption.Other.reference,
     .single "stateRepr" Table.CellOption.Other.stateRepr]

inductive Table.CellOption where
  | declaration : String → Table.CellOption
  | other : Table.CellOption.Other → Table.CellOption

instance schemaTableCellOption : SchemaFor Table.CellOption :=
  .inductive "tableCellOption"
    [.unary "declaration" String (fun | .declaration d => some d | _ => none),
     .unary "other" Table.CellOption.Other (fun | .other o => some o | _ => none)]

structure Table.CellEntry where
  columnKey : String
  options : Array Table.CellOption

instance : SchemaFor Table.CellEntry :=
  .structure "tableCellEntry"
    [.single "columnKey" Table.CellEntry.columnKey,
     .arr "options" Table.CellEntry.options]

structure Table.CellDataForRowValue where
  sourceLayerIdentifier : String
  rowKey : String
  targetLayerIdentifier : String
  options : Array Table.CellOption

instance : SchemaFor Table.CellDataForRowValue :=
  .structure "tableCellDataForRowValue"
    [.single "sourceLayerIdentifier" Table.CellDataForRowValue.sourceLayerIdentifier,
     .single "rowKey" Table.CellDataForRowValue.rowKey,
     .single "targetLayerIdentifier" Table.CellDataForRowValue.targetLayerIdentifier,
     .arr "options" Table.CellDataForRowValue.options]

structure Table.Definition where
  widgetId : String
  rowKind : DataKind
  columnKind : DataKind
  cellKind : DataKind
  rowSource : Table.AssociationSource
  columnSource : Table.AssociationSource
  cells : Array CellDataForRowValue

instance schemaTableDefinition : SchemaFor Table.Definition :=
  .structure "tableDefinition"
    [.single "widgetId" Table.Definition.widgetId,
     .single "rowKind" Table.Definition.rowKind,
     .single "columnKind" Table.Definition.columnKind,
     .single "cellKind" Table.Definition.cellKind,
     .single "rowSource" Table.Definition.rowSource,
     .single "columnSource" Table.Definition.columnSource,
     .arr "cells" Table.Definition.cells]

structure Table where
  definition : Table.Definition
  state : Table.State
  facts : Array Table.Fact

instance : SchemaFor Table :=
  .structure "table"
    [.single "definition" Table.definition,
     .single "state" Table.state,
     .arr "facts" Table.facts]

end Data

namespace Table

end Table

def processTable {rowKind columnKind cellKind : DataKind} {δ : Type} [HasId δ] [DisplayShort δ]
    {l : List δ} (t : Table rowKind columnKind cellKind l) : RenderM Data.Table := sorry

end Grove.Framework.Backend.Full
