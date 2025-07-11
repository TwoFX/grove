/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Backend.Data
import Grove.Framework.Backend.RenderM.RenderInfo
import Grove.Framework.Reference
import Grove.Framework.Widget.AssociationTable.Compare
import Std.Data.Iterators

open Lean

namespace Grove.Framework.Backend.Full

open Widget JTD

namespace Data

structure AssociationTable.Cell where
  columnIdentifier : String
  cellValue : String

instance : SchemaFor AssociationTable.Cell :=
  .structure "associationTableCell"
    [.single "columnIdentifier" AssociationTable.Cell.columnIdentifier,
     .single "cellValue" AssociationTable.Cell.cellValue]

structure AssociationTable.Row where
  uuid : String
  title : String
  columns : Array AssociationTable.Cell

instance : SchemaFor AssociationTable.Row :=
  .structure "associationTableRow"
    [.single "uuid" AssociationTable.Row.uuid,
     .single "title" AssociationTable.Row.title,
     .arr "columns" AssociationTable.Row.columns]

structure AssociationTable.CellOption.Other where
  value : String
  shortDescription : String
  longDescription : String
  reference : Reference
  stateRepr : String

instance : SchemaFor AssociationTable.CellOption.Other :=
  .structure "associationTableCellOptionOther"
    [.single "value" AssociationTable.CellOption.Other.value,
     .single "shortDescription" AssociationTable.CellOption.Other.shortDescription,
     .single "longDescription" AssociationTable.CellOption.Other.longDescription,
     .single "reference" AssociationTable.CellOption.Other.reference,
     .single "stateRepr" AssociationTable.CellOption.Other.stateRepr]

inductive AssociationTable.CellOption where
  | declaration : String → AssociationTable.CellOption
  | other : AssociationTable.CellOption.Other → AssociationTable.CellOption

instance : SchemaFor AssociationTable.CellOption :=
  .inductive "associationTableCellOption"
    [.unary "declaration" String (fun | .declaration d => some d | _ => none),
     .unary "other" AssociationTable.CellOption.Other (fun | .other o => some o | _ => none)]

structure AssociationTable.ColumnDiscription where
  identifier : String
  shortDescription : String
  options : Array AssociationTable.CellOption

instance : SchemaFor AssociationTable.ColumnDiscription :=
  .structure "associationTableColumnDescription"
    [.single "identifier" AssociationTable.ColumnDiscription.identifier,
     .single "shortDescription" AssociationTable.ColumnDiscription.shortDescription,
     .arr "options" AssociationTable.ColumnDiscription.options]

structure AssociationTable.Fact.CellState where
  columnIdentifier : String
  cellValue : String
  stateRepr : String

instance : SchemaFor AssociationTable.Fact.CellState :=
  .structure "associationTableFactCellState"
    [.single "columnIdentifier" AssociationTable.Fact.CellState.columnIdentifier,
     .single "cellValue" AssociationTable.Fact.CellState.cellValue,
     .single "stateRepr" AssociationTable.Fact.CellState.stateRepr]

structure AssociationTable.Fact where
  widgetId : String
  factId : String
  rowId : String
  state : Array (AssociationTable.Fact.CellState)
  metadata : Fact.Metadata
  validationResult : Fact.ValidationResult

instance : ValidatedFact AssociationTable.Fact where
  widgetId := AssociationTable.Fact.widgetId
  factId := AssociationTable.Fact.factId
  validationResult := AssociationTable.Fact.validationResult

instance : SchemaFor AssociationTable.Fact :=
  .structure "associationTableFact"
    [.single "widgetId" AssociationTable.Fact.widgetId,
     .single "factId" AssociationTable.Fact.factId,
     .single "rowId" AssociationTable.Fact.rowId,
     .arr "state" AssociationTable.Fact.state,
     .single "metadata" AssociationTable.Fact.metadata,
     .single "validationResult" AssociationTable.Fact.validationResult]

structure AssociationTable.Definition where
  widgetId : String
  title : String
  description : String
  dataKind : DataKind
  columns : Array AssociationTable.ColumnDiscription

instance : SchemaFor AssociationTable.Definition :=
  .structure "associationTableDefinition"
    [.single "widgetId" AssociationTable.Definition.widgetId,
     .single "title" AssociationTable.Definition.title,
     .single "description" AssociationTable.Definition.description,
     .single "dataKind" AssociationTable.Definition.dataKind,
     .arr "columns" AssociationTable.Definition.columns]

structure AssociationTable.State where
  rows : Array AssociationTable.Row

instance : SchemaFor AssociationTable.State :=
  .structure "associationTableState"
    [.arr "rows" AssociationTable.State.rows]

structure AssociationTable where
  definition : AssociationTable.Definition
  state : AssociationTable.State
  facts : Array AssociationTable.Fact

instance : SchemaFor AssociationTable :=
  .structure "associationTable"
    [.single "definition" AssociationTable.definition,
     .single "state" AssociationTable.state,
     .arr "facts" AssociationTable.facts]

end Data

namespace AssociationTable

def processRenderInfo {kind : DataKind} : RenderInfo kind → Data.AssociationTable.CellOption
  | .decl n => .declaration n.toString
  | .other o => .other { o with }

def processCellOption {kind : DataKind} (key : kind.Key) : RenderM (String × Data.AssociationTable.CellOption) := do
  let r ← kind.renderInfo key
  return (r.displayShort, processRenderInfo r)

def processColumnDescription [HasId β] [DisplayShort β] {kind : DataKind} (b : β)
    (dataSource : DataSource kind) : RenderM Data.AssociationTable.ColumnDiscription := do
  let all ← dataSource.getAll
  let pairs ← all.mapM processCellOption
  let pairs := pairs.qsort (fun a b => a.1 < b.1)
  return {
    identifier := HasId.getId b
    shortDescription := DisplayShort.displayShort b
    options := pairs.map (·.2)
  }

def processColumnDescriptions {kind : DataKind} {β : Type} [HasId β] [DisplayShort β] (l : List β)
    (dataSources : β → DataSource kind) : RenderM (Array Data.AssociationTable.ColumnDiscription) :=
  l.iter.mapM (fun b => processColumnDescription b (dataSources b)) |>.toArray

def processRows {kind : DataKind} (savedData : AssociationTable.Data kind) : Array Data.AssociationTable.Row :=
  savedData.rows.map (fun r => ⟨r.uuid, r.title, r.columns.map (fun c => { c with })⟩)

def computeCellState [HasId β] (b : β) (kind : DataKind) (rowId : String)
    (cellValueMap : Std.HashMap (String × String) String) (dataSources : β → DataSource kind) :
    MetaM (Option (AssociationTable.Fact.CellState kind)) :=
  cellValueMap[(rowId, HasId.getId b)]?.bindM fun cellValue => do
    let some key ← (dataSources b).getById? cellValue | return none
    let cellState ← kind.getState key
    return some ⟨HasId.getId b, cellValue, cellState⟩

def computeRowState [HasId β] (kind : DataKind) (l : List β) (rowId : String) (cellValueMap : Std.HashMap (String × String) String)
    (dataSources : β → DataSource kind) :
    MetaM (Array (AssociationTable.Fact.CellState kind)) :=
  l.iter.filterMapM (computeCellState · kind rowId cellValueMap dataSources) |>.toArray

def transformCellState {kind : DataKind} (s : AssociationTable.Fact.CellState kind) :
    Data.AssociationTable.Fact.CellState where
  columnIdentifier := s.columnIdentifier
  cellValue := s.cellValue
  stateRepr := kind.reprState s.cellState

def processFact [HasId β] [DisplayShort β] {kind : DataKind} (l : List β) (f : AssociationTable.Fact kind)
    (cellValueMap : Std.HashMap (String × String) String) (dataSources : β → DataSource kind) :
    RenderM (Option Data.AssociationTable.Fact) := do
  -- TODO: if the rowId doesn't even exist any more, we shouldn't return this as invalidated, but
  -- drop the fact here.
  let currentState ← computeRowState kind l f.rowId cellValueMap dataSources
  let validationResult : Fact.ValidationResult :=
    match AssociationTable.Fact.describeDifferences l f.rowState currentState with
    | none => .ok
    | some s => .invalidated ⟨"Row has changed", s⟩

  return some {
    widgetId := f.widgetId
    factId := f.factId
    rowId := f.rowId
    state := f.rowState.map transformCellState
    metadata := f.metadata
    validationResult
  }

def processFacts [HasId β] [DisplayShort β] {kind : DataKind} (l : List β) (facts : Array (AssociationTable.Fact kind))
    (cellValueMap : Std.HashMap (String × String) String) (dataSources : β → DataSource kind) : RenderM (Array Data.AssociationTable.Fact) :=
  facts.filterMapM (processFact l · cellValueMap dataSources)

end AssociationTable

open AssociationTable

def processAssociationTable {kind : DataKind} {β : Type} [HasId β] [DisplayShort β] {l : List β}
    (t : AssociationTable kind l) : RenderM Data.AssociationTable := do
  let columns ← processColumnDescriptions l t.dataSources

  let definition : Data.AssociationTable.Definition := {
    widgetId := t.id
    title := t.title
    description := t.description
    dataKind := kind
    columns := columns
  }

  let some savedData ← findAssociationTable? kind t.id
    | return ⟨definition, ⟨#[]⟩, #[]⟩

  let cellValueMap : Std.HashMap (String × String) String :=
    savedData.rows.foldl (init := ∅) (fun sofar row => row.columns.foldl (init := sofar)
      (fun sofar' col => sofar'.insert (row.uuid, col.columnIdentifier) col.cellValue))

  return {
    definition
    state := {
      rows := processRows savedData
    }
    facts := ← processFacts l savedData.facts cellValueMap t.dataSources
  }

end Grove.Framework.Backend.Full
