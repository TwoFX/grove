/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.Display
public import Grove.Framework.Widget.AssociationTable.Basic
import Grove.Framework.Display
public import Grove.Markdown.Basic

namespace Grove.Framework.Widget.AssociationTable.Fact

public def describeDifferences {β : Type} [HasId β] [DisplayShort β] (columnIdentifiers : List β)
    {kind : DataKind} (old new : Array (CellState kind)) : Option String :=
  let differences := columnIdentifiers.flatMap (fun identifier =>
    describeCellDifference identifier (findCell old identifier) (findCell new identifier))
  if differences.isEmpty then none else Markdown.render differences
where
  findCell (arr : Array (CellState kind)) (identifier : β) : Option (CellState kind) :=
    arr.find? (fun cell => cell.columnIdentifier == HasId.getId identifier)
  describeCellDifference (l : β) : Option (CellState kind) → Option (CellState kind) → List Markdown.Paragraph
    | none, none => []
    | none, some s => [s!"**Column {DisplayShort.displayShort l}** used to be empty, now contains `{kind.displayShort s.cellState}`"]
    | some s, none => [s!"**Column {DisplayShort.displayShort l}** used to contain `{kind.displayShort s.cellState}`, now is empty"]
    | some old, some new =>
        match kind.describeDifferences old.cellState new.cellState with
        | none => []
        | some desc => [s!"**Column {DisplayShort.displayShort l}:**", desc]

end Grove.Framework.Widget.AssociationTable.Fact
