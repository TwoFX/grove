/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Widget.Table.Basic
import Grove.Framework.Display

open Std

namespace Grove.Framework.Widget.Table.Fact

def describeDifferences {β : Type} [HasId β] [DisplayShort β] (columnIdentifiers : List β)
    {rowKind columnKind cellKind : DataKind}
    (old new : Array (LayerState rowKind columnKind cellKind)) : Option String :=
  let differences := columnIdentifiers.flatMap (fun identifier =>
    describeLayerStateDifference identifier (findLayerState old identifier) (findLayerState new identifier))
  if differences.isEmpty then none else Markdown.render differences
where
  findLayerState (arr : Array (LayerState rowKind columnKind cellKind)) (identifier : β) :
      Option (LayerState rowKind columnKind cellKind) :=
    arr.find? (fun lay => lay.layerIdentifier == HasId.getId identifier)
  describeLayerStateDifference (l : β) (old new : Option (LayerState rowKind columnKind cellKind)) :
      List Markdown.Paragraph :=
    match old, new with
    | none, none => []
    | none, some _ => [s!"**Layer {DisplayShort.displayShort l}** used to be empty, now contains something."]
    | some _, none => [s!"**Layer {DisplayShort.displayShort l}** used to contain something, now is empty."]
    | some old, some new =>
        let differences := describeSingleStateDifference "Row state" old.rowState new.rowState
          ++ describeSingleStateDifference "Column state" old.columnState new.columnState
          ++ describeSingleStateDifferences old.selectedCellStates new.selectedCellStates
        if differences.isEmpty then [] else s!"**Layer {DisplayShort.displayShort l}**:" :: differences
  describeSingleStateDifferences {kind : DataKind} (old new : Array (SingleState kind)) :
      List Markdown.Paragraph :=
    let allCellValues := (HashSet.ofArray ((old ++ new).map SingleState.value)).toArray
    allCellValues.flatMap (β := Markdown.Paragraph) (fun value =>
      -- TODO: performance
      let oldState := old.find? (fun st => st.value == value)
      let newState := new.find? (fun st => st.value == value)
      match oldState, newState with
      | none, none => #[]
      | none, some s => #[s!"`{kind.displayShort s.state}` used to not be selected, now is."]
      | some s, none => #[s!"`{kind.displayShort s.state}` used to be selected, now is not."]
      | some old, some new =>
          match kind.describeDifferences old.state new.state with
          | none => #[]
          | some descr => #[s!"Selected value `{kind.displayShort old.state}`:", descr]) |>.toList
  describeSingleStateDifference (name : String) {kind : DataKind} (old new : Option (SingleState kind)) :
      List Markdown.Paragraph :=
    match old, new with
    | none, none => []
    | none, some s => [s!"{name} used to be empty, now contains `{kind.displayShort s.state}`."]
    | some s, none => [s!"{name} used to contain `{kind.displayShort s.state}`, now is empty."]
    | some old, some new =>
        match kind.describeDifferences old.state new.state with
        | none => []
        | some desc => [s!"{name}:", desc]


end Grove.Framework.Widget.Table.Fact
