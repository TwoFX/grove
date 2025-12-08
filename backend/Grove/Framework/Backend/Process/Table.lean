/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.Widget.Table.Basic
public import Grove.Framework.Display
public import Grove.Framework.Backend.RenderM.Basic
import Grove.Framework.Backend.Data
public import Grove.Framework.Backend.RenderM.RenderInfo
public import Grove.Framework.Reference
public import Grove.Framework.Widget.Table.Compare
import Std.Data.Iterators

namespace Grove.Framework.Backend.Full

open Widget JTD

namespace Data

public structure Table.SelectedCellOptions where
  layerIdentifier : String
  rowValue : String
  columnValue : String
  selectedCellOptions : Array String

public instance : SchemaFor Table.SelectedCellOptions :=
  .structure "tableSelectedCellOptions"
    [.single "layerIdentifier" Table.SelectedCellOptions.layerIdentifier,
     .single "rowValue" Table.SelectedCellOptions.rowValue,
     .single "columnValue" Table.SelectedCellOptions.columnValue,
     .arr "selectedCellOptions" Table.SelectedCellOptions.selectedCellOptions]

public structure Table.State where
  selectedRowAssociations : Array String
  selectedColumnAssociations : Array String
  selectedCellOptions : Array Table.SelectedCellOptions
  selectedLayers : Array String

public instance schemaTableState : SchemaFor Table.State :=
  .structure "tableState"
    [.arr "selectedRowAssociations" Table.State.selectedRowAssociations,
     .arr "selectedColumnAssociations" Table.State.selectedColumnAssociations,
     .arr "selectedCellOptions" Table.State.selectedCellOptions,
     .arr "selectedLayers" Table.State.selectedLayers]

public structure Table.Fact.Identifier where
  rowAssociationId : String
  columnAssociationId : String
  selectedLayers : Array String

public instance : SchemaFor Table.Fact.Identifier :=
  .structure "tableFactIdentifier"
    [.single "rowAssociationId" Table.Fact.Identifier.rowAssociationId,
     .single "columnAssociationId" Table.Fact.Identifier.columnAssociationId,
     .arr "selectedLayers" Table.Fact.Identifier.selectedLayers]

-- Can be row, column, or cell, for one layer.
public structure Table.Fact.SingleState where
  value : String
  stateRepr : String

public instance : SchemaFor Table.Fact.SingleState :=
  .structure "tableFactSingleState"
    [.single "value" Table.Fact.SingleState.value,
     .single "stateRepr" Table.Fact.SingleState.stateRepr]

public inductive Table.Fact.OptionalSingleState where
  | none : Table.Fact.OptionalSingleState
  | some : Table.Fact.SingleState → Table.Fact.OptionalSingleState

public instance : SchemaFor Table.Fact.OptionalSingleState :=
  .inductive "tableFactOptionalSingleState"
    [.nullary "none" (fun | .none => true | _ => false),
     .unary "some" Table.Fact.SingleState (fun | .some s => some s | _ => none)]

public structure Table.Fact.LayerState where
  layerIdentifier : String
  rowState : Table.Fact.OptionalSingleState
  columnState : Table.Fact.OptionalSingleState
  selectedCellStates : Array Table.Fact.SingleState

public instance : SchemaFor Table.Fact.LayerState :=
  .structure "tableFactLayerState"
    [.single "layerIdentifier" Table.Fact.LayerState.layerIdentifier,
     .single "rowState" Table.Fact.LayerState.rowState,
     .single "columnState" Table.Fact.LayerState.columnState,
     .arr "selectedCellStates" Table.Fact.LayerState.selectedCellStates]

public structure Table.Fact.State where
  layerStates : Array Table.Fact.LayerState

public instance schemaTableFactState : SchemaFor Table.Fact.State :=
  .structure "tableFactState"
    [.arr "layerStates" Table.Fact.State.layerStates]

public structure Table.Fact where
  widgetId : String
  factId : String
  identifier : Table.Fact.Identifier
  state : Table.Fact.State
  metadata : Fact.Metadata
  validationResult : Fact.ValidationResult

public instance validatedFactTableFact : ValidatedFact Table.Fact where
  widgetId := Table.Fact.widgetId
  factId := Table.Fact.factId
  validationResult := Table.Fact.validationResult

public instance schemaTableFact : SchemaFor Table.Fact :=
  .structure "tableFact"
    [.single "widgetId" Table.Fact.widgetId,
     .single "factId" Table.Fact.factId,
     .single "identifier" Table.Fact.identifier,
     .single "state" Table.Fact.state,
     .single "metadata" Table.Fact.metadata,
     .single "validationResult" Table.Fact.validationResult]

public structure Table.AssociationLayer.Data.Other where
  value : String
  shortDescription : String
  longDescription : String
  reference : Reference
  stateRepr : String

public instance schemaTableAssociationLayerDataOther : SchemaFor Table.AssociationLayer.Data.Other :=
  .structure "tableAssociationLayerDataOther"
    [.single "value" Table.AssociationLayer.Data.Other.value,
     .single "shortDescription" Table.AssociationLayer.Data.Other.shortDescription,
     .single "longDescription" Table.AssociationLayer.Data.Other.longDescription,
     .single "reference" Table.AssociationLayer.Data.Other.reference,
     .single "stateRepr" Table.AssociationLayer.Data.Other.stateRepr]

public inductive Table.AssociationLayer.Data where
  | declaration : String → Table.AssociationLayer.Data
  | other : Table.AssociationLayer.Data.Other → Table.AssociationLayer.Data

public instance : SchemaFor Table.AssociationLayer.Data :=
  .inductive "tableAssociationLayerData"
    [.unary "declaration" String (fun | .declaration d => some d | _ => none),
     .unary "other" Table.AssociationLayer.Data.Other (fun | .other o => some o | _ => none)]

public structure Table.AssociationLayer where
  layerIdentifier : String
  data : Table.AssociationLayer.Data

public instance : SchemaFor Table.AssociationLayer :=
  .structure "tableAssociationLayer"
    [.single "layerIdentifier" Table.AssociationLayer.layerIdentifier,
     .single "data" Table.AssociationLayer.data]

public structure Table.Association where
  id : String
  title : String
  layers : Array Table.AssociationLayer

public instance : SchemaFor Table.Association :=
  .structure "tableAssociation"
    [.single "id" Table.Association.id,
      .single "title" Table.Association.title,
     .arr "layers" Table.Association.layers]

public structure Table.ConstantAssociationSource where
  associations : Array Table.Association

public instance : SchemaFor Table.ConstantAssociationSource :=
  .structure "tableConstantAssociationSource"
    [.arr "associations" Table.ConstantAssociationSource.associations]

public inductive Table.AssociationSource where
  | const : Table.ConstantAssociationSource → Table.AssociationSource
  | table : /- widgetId -/ String → Table.AssociationSource

public instance : SchemaFor Table.AssociationSource :=
  .inductive "tableAssociationSource"
    [.unary "const" Table.ConstantAssociationSource (fun | .const t => some t | _ => none),
     .unary "table" String (fun | .table t => some t | _ => none)]

public structure Table.CellOption.Other where
  value : String
  shortDescription : String
  longDescription : String
  reference : Reference
  stateRepr : String

public instance schemaTableCellOptionOther : SchemaFor Table.CellOption.Other :=
  .structure "tableCellOptionOther"
    [.single "value" Table.CellOption.Other.value,
     .single "shortDescription" Table.CellOption.Other.shortDescription,
     .single "longDescription" Table.CellOption.Other.longDescription,
     .single "reference" Table.CellOption.Other.reference,
     .single "stateRepr" Table.CellOption.Other.stateRepr]

public inductive Table.CellOption where
  | declaration : String → Table.CellOption
  | other : Table.CellOption.Other → Table.CellOption

public instance schemaTableCellOption : SchemaFor Table.CellOption :=
  .inductive "tableCellOption"
    [.unary "declaration" String (fun | .declaration d => some d | _ => none),
     .unary "other" Table.CellOption.Other (fun | .other o => some o | _ => none)]

public structure Table.CellEntry where
  columnKey : String
  options : Array Table.CellOption

public instance : SchemaFor Table.CellEntry :=
  .structure "tableCellEntry"
    [.single "columnKey" Table.CellEntry.columnKey,
     .arr "options" Table.CellEntry.options]

public structure Table.CellDataForRowValue where
  rowKey : String
  targetLayerIdentifier : String
  cellEntries : Array Table.CellEntry

public instance : SchemaFor Table.CellDataForRowValue :=
  .structure "tableCellDataForRowValue"
    [.single "rowKey" Table.CellDataForRowValue.rowKey,
     .single "targetLayerIdentifier" Table.CellDataForRowValue.targetLayerIdentifier,
     .arr "cellEntries" Table.CellDataForRowValue.cellEntries]

public structure Table.CellDataForLayer where
  sourceLayerIdentifier : String
  rows : Array Table.CellDataForRowValue

public instance : SchemaFor Table.CellDataForLayer :=
  .structure "tableCellDataForLayer"
    [.single "sourceLayerIdentifier" Table.CellDataForLayer.sourceLayerIdentifier,
     .arr "rows" Table.CellDataForLayer.rows]

public structure Table.Definition where
  widgetId : String
  title : String
  description : String
  rowKind : DataKind
  columnKind : DataKind
  cellKind : DataKind
  layerIdentifiers : Array String
  rowSource : Table.AssociationSource
  columnSource : Table.AssociationSource
  cells : Array CellDataForLayer

public instance schemaTableDefinition : SchemaFor Table.Definition :=
  .structure "tableDefinition"
    [.single "widgetId" Table.Definition.widgetId,
     .single "title" Table.Definition.title,
     .single "description" Table.Definition.description,
     .single "rowKind" Table.Definition.rowKind,
     .single "columnKind" Table.Definition.columnKind,
     .single "cellKind" Table.Definition.cellKind,
     .arr "layerIdentifiers" Table.Definition.layerIdentifiers,
     .single "rowSource" Table.Definition.rowSource,
     .single "columnSource" Table.Definition.columnSource,
     .arr "cells" Table.Definition.cells]

public structure Table where
  definition : Table.Definition
  state : Table.State
  facts : Array Table.Fact

public instance : SchemaFor Table :=
  .structure "table"
    [.single "definition" Table.definition,
     .single "state" Table.state,
     .arr "facts" Table.facts]

end Data

namespace Table

structure ProcessAssociationSourceResult (kind : DataKind) {β : Type} (layerIdentifiers : List β) where
  associationSource : Data.Table.AssociationSource
  possibleKeys : Vector (Array kind.Key) layerIdentifiers.length
  associations : Std.HashMap (/- (associationId, layerId) -/ String × String) kind.Key

def processAssociationLayer {kind : DataKind} {β : Type} [HasId β] (l : Table.AssociationLayer kind β) :
    RenderM Data.Table.AssociationLayer := do
  let renderInfo ← kind.renderInfo l.layerValue
  let layerIdentifier := HasId.getId l.layerIdentifier
  match renderInfo with
  | .decl n => return ⟨layerIdentifier, .declaration n.toString⟩
  | .other o => return ⟨layerIdentifier, .other { o with }⟩

def processAssociationSource {kind : DataKind} {β : Type} [BEq β] [HasId β] {layerIdentifiers : List β}
    (s : Table.AssociationSource kind layerIdentifiers) :
    RenderM (ProcessAssociationSourceResult kind layerIdentifiers) :=
  match s with
  | .const a => do
    let arr ← a
    let source : Data.Table.AssociationSource := .const ⟨← arr.mapM
      (fun assoc => return ⟨assoc.id, assoc.title, ← assoc.layers.mapM processAssociationLayer⟩)⟩

    let possibleValues : Vector (Array kind.Key) layerIdentifiers.length := Vector.ofFn (fun idx =>
      arr.flatMap (fun assoc =>
        assoc.layers.filterMap (fun layer =>
          -- TODO: performance
          if layer.layerIdentifier == layerIdentifiers[idx] then some layer.layerValue else none)))

    let associations := arr.foldl (init := ∅) (fun sofar assoc =>
      assoc.layers.foldl (init := sofar) (fun sofar layer => sofar.insert (assoc.id, HasId.getId layer.layerIdentifier) layer.layerValue))

    return ⟨source, possibleValues, associations⟩
  | .table t => do
    let possibleValues : Vector (Array kind.Key) layerIdentifiers.length ←
      Vector.ofFnM (fun idx => (t.dataSources layerIdentifiers[idx]).getAll)

    let some tableData ← findAssociationTable? kind t.id
      | return ⟨.table t.id, possibleValues, ∅⟩

    let associations ← tableData.rows.foldlM (init := ∅) (fun sofar row => row.columns.foldlM (init := sofar) (fun sofar cell => do
      -- TODO: this is terrible.
      let some layer := layerIdentifiers.find? (fun b => HasId.getId b == cell.columnIdentifier) | return sofar
      let dataSource := t.dataSources layer
      let some key ← dataSource.getById? cell.cellValue | return sofar
      return sofar.insert (row.uuid, cell.columnIdentifier) key))

    return ⟨.table t.id, possibleValues, associations⟩

def processCellDataProvider {rowKind columnKind cellKind : DataKind} {δ : Type} [HasId δ]
    {layerIdentifiers : List δ}
    (rowValues : Vector (Array rowKind.Key) layerIdentifiers.length)
    (columnValues : Vector (Array columnKind.Key) layerIdentifiers.length)
    (p : Table.CellDataProvider rowKind columnKind cellKind layerIdentifiers) :
    RenderM (Array Data.Table.CellDataForLayer) := do
  let cells ← p.getCells rowValues columnValues
  let layers ← cells.mapFinIdxM (fun idx layer hidx => do return {
    sourceLayerIdentifier := HasId.getId layerIdentifiers[idx]
    rows := ← layer.mapIdxM (fun ridx cellData => mapCellDataForRowValue idx hidx ridx cellData)
  })
  return layers.toArray
where
  mapCellDataForRowValue (idx : Nat) (hidx : idx < layerIdentifiers.length) (ridx : Nat)
      (d : Table.CellDataForRowValue columnKind cellKind layerIdentifiers columnValues) :
      RenderM Data.Table.CellDataForRowValue := do return {
    rowKey := rowKind.keyString (rowValues[idx][ridx]!)
    targetLayerIdentifier := HasId.getId layerIdentifiers[d.targetLayerIndex]
    cellEntries := (Vector.toArray <| ← d.cells.mapFinIdxM (fun cidx cell hcidx => do return {
      columnKey := columnKind.keyString columnValues[d.targetLayerIndex][cidx]
      options := ← cell.mapM (fun k => mapRenderInfo <$> cellKind.renderInfo k)
    })).filter (fun cellEntry => !cellEntry.options.isEmpty)
  }
  mapRenderInfo : RenderInfo cellKind → Data.Table.CellOption
    | .decl n => .declaration n.toString
    | .other o => .other { o with }

def transformLayerState {rowKind columnKind cellKind : DataKind}
    (f : Table.Fact.LayerState rowKind columnKind cellKind) : RenderM Data.Table.Fact.LayerState := do
  return {
    layerIdentifier := f.layerIdentifier
    rowState := transformOptionSingleState f.rowState
    columnState := transformOptionSingleState f.columnState
    selectedCellStates := f.selectedCellStates.map (fun cell =>
      ⟨cell.value, cellKind.reprState cell.state⟩)
  }
where
  transformOptionSingleState {kind : DataKind} : Option (Table.Fact.SingleState kind) → Data.Table.Fact.OptionalSingleState
    | none => .none
    | some s => .some ⟨s.value, kind.reprState s.state⟩

def transformState {rowKind columnKind cellKind : DataKind}
    (f : Table.Fact rowKind columnKind cellKind) : RenderM Data.Table.Fact.State :=
  Data.Table.Fact.State.mk <$> f.layerStates.mapM transformLayerState

def currentLayerState {rowKind columnKind cellKind : DataKind} {δ : Type} {layerIdentifiers : List δ}
    (cellDataProvider : Table.CellDataProvider rowKind columnKind cellKind layerIdentifiers)
    (rowAssociations : Std.HashMap (String × String) rowKind.Key)
    (columnAssociations : Std.HashMap (String × String) columnKind.Key)
    (selectedCellOptions : Std.HashMap (String × String × String) (Array String))
    (rowAssociationId : String) (columnAssociationId : String) (layerIdentifier : String) :
    RenderM (Table.Fact.LayerState rowKind columnKind cellKind) := do
  -- Note: if the source layer identifier and the target layer identifier aren't the same, then
  -- `rowAssoc`, `colAssoc` and `cellStates` won't have anything to do with each other, but that
  -- is fine, it's just how the data is organized (by layer rather than by row).
  let rowAssoc ← currentRCState rowAssociations rowAssociationId
  let colAssoc ← currentRCState columnAssociations columnAssociationId
  let cellOpts := selectedCellOptions.getD (layerIdentifier, rowAssociationId, columnAssociationId) #[]
  let cellStates : Array (Table.Fact.SingleState cellKind) ←
    cellOpts.iter
      |>.filterMapM (cellDataProvider.getById? ·)
      |>.mapM st
      |>.toArray
  return ⟨layerIdentifier, rowAssoc, colAssoc, cellStates⟩
where
  currentRCState {kind : DataKind} (associations : Std.HashMap (String × String) kind.Key)
      (associationId : String) : RenderM (Option (Table.Fact.SingleState kind)) :=
    associations[(associationId, layerIdentifier)]?.mapM st
  st {kind : DataKind} (k : kind.Key) : RenderM (Table.Fact.SingleState kind) :=
    return ⟨kind.keyString k, ← kind.getState k⟩

def currentFactState {rowKind columnKind cellKind : DataKind} {δ : Type} {layerIdentifiers : List δ}
    (cellDataProvider : Table.CellDataProvider rowKind columnKind cellKind layerIdentifiers)
    (rowAssociations : Std.HashMap (String × String) rowKind.Key)
    (columnAssociations : Std.HashMap (String × String) columnKind.Key)
    (selectedCellOptions : Std.HashMap (String × String × String) (Array String))
    (rowAssociationId : String) (columnAssociationId : String) (selectedLayers : Array String) :
    RenderM (Array (Table.Fact.LayerState rowKind columnKind cellKind)) :=
  selectedLayers.filterMapM (fun layer => currentLayerState cellDataProvider rowAssociations columnAssociations selectedCellOptions rowAssociationId columnAssociationId layer)

def processFact {rowKind columnKind cellKind : DataKind} {δ : Type} [HasId δ] [DisplayShort δ]
    {layerIdentifiers : List δ}
    (cellDataProvider : Table.CellDataProvider rowKind columnKind cellKind layerIdentifiers)
    (rowAssociations : Std.HashMap (String × String) rowKind.Key)
    (columnAssociations : Std.HashMap (String × String) columnKind.Key)
    (selectedCellOptions : Std.HashMap (String × String × String) (Array String))
    (f : Table.Fact rowKind columnKind cellKind) : RenderM Data.Table.Fact := do
  let newState ← currentFactState cellDataProvider rowAssociations columnAssociations selectedCellOptions f.rowAssociationId f.columnAssociationId
    f.selectedLayers

  let validationResult : Fact.ValidationResult :=
    match Table.Fact.describeDifferences layerIdentifiers f.layerStates newState with
    | none => .ok
    | some s => .invalidated ⟨"Cell has changed", s⟩

  return {
    widgetId := f.widgetId
    factId := f.factId
    identifier := {
      rowAssociationId := f.rowAssociationId
      columnAssociationId := f.columnAssociationId
      selectedLayers := f.selectedLayers
    }
    state := ← transformState f
    metadata := f.metadata
    validationResult
  }

end Table


public def processTable {rowKind columnKind cellKind : DataKind} {δ : Type} [BEq δ] [HasId δ] [DisplayShort δ]
    {l : List δ} (t : Table rowKind columnKind cellKind l) : RenderM Data.Table := do
  let ⟨rowSource, rowValues, rowAssociations⟩ ← Table.processAssociationSource t.rowsFrom
  let ⟨columnSource, columnValues, columnAssociations⟩ ← Table.processAssociationSource t.columnsFrom
  let cells ← Table.processCellDataProvider rowValues columnValues t.cellData

  let definition : Data.Table.Definition := {
    widgetId := t.id
    title := t.title
    description := t.description
    layerIdentifiers := l.iter.map HasId.getId |>.toArray
    rowKind
    columnKind
    cellKind
    rowSource
    columnSource
    cells
  }

  let some savedData ← findTable? rowKind columnKind cellKind t.id
    | return ⟨definition, ⟨#[], #[], #[], #[]⟩, #[]⟩

  let state : Data.Table.State := {
    selectedRowAssociations := savedData.selectedRowAssociations
    selectedColumnAssociations := savedData.selectedColumnAssociations
    selectedCellOptions := savedData.selectedCellOptions.map (fun o => { o with })
    selectedLayers := savedData.selectedLayers
  }

  let selectedCellOptionMap : Std.HashMap (String × String × String) (Array String) :=
    state.selectedCellOptions.foldl (init := ∅) (fun sofar o =>
      sofar.insert (o.layerIdentifier, o.rowValue, o.columnValue) o.selectedCellOptions)

  let facts ← savedData.facts.mapM (Table.processFact t.cellData rowAssociations columnAssociations selectedCellOptionMap)

  return { definition, state, facts }

end Grove.Framework.Backend.Full
