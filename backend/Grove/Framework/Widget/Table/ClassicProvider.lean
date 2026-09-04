/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.Widget.Table.CellDataProvider

open Lean

namespace Grove.Framework.Widget.Table

open DataSource

namespace CellDataProvider

namespace Classic

-- Target namespace overrides, ...
public structure Configuration where
  relevantNamespaces : Option (List Name) := none
  declarationPredicate : DeclarationPredicate := .true

structure RelevantConstant where
  name : Name
  type : Expr
  usedConstants : NameSet

/--
Collects all declarations that may appear in a cell, together with their types and the constants
occurring in their types.
-/
def collectRelevantConstants (config : Configuration) (layerIdentifiers : List Name) :
    LookupM (Array RelevantConstant) := do
  let relevantNamespaces := config.relevantNamespaces.getD layerIdentifiers
  let pred := DeclarationPredicate.notInternal.and config.declarationPredicate

  let allDecls ← allDeclarations
  let mut names : Std.HashSet Name := ∅
  for namesp in relevantNamespaces do
    if let some t := allDecls.navigate? namesp then
      names := t.fold (init := names) (fun sofar n _ => sofar.insert (namesp ++ n))

  let env ← getEnv
  let mut relevantConstants := #[]
  for name in names do
    let some constantInfo := env.find? name | continue
    if !(← pred.check name constantInfo) then
      continue
    let type := constantInfo.type
    relevantConstants := relevantConstants.push ⟨name, type, type.getUsedConstantsAsSet⟩
  return relevantConstants

/--
An index over a collection of subexpressions, each tagged with a value of type `α`, which makes it
possible to quickly find all subexpressions occurring in a given type.

A subexpression `Subexpression.declaration n` occurs in a type if and only if `n` is one of the
constants occurring in the type, so the tags of all such subexpressions are found by looking up the
constants occurring in the type. Only the predicate subexpressions need to be checked individually.
-/
structure SubexpressionIndex (α : Type) where
  byDeclaration : Std.HashMap Name (Array α) := ∅
  predicates : Array (PredicateSubexpression × α) := #[]

def SubexpressionIndex.insert (idx : SubexpressionIndex α) (s : Subexpression) (a : α) :
    SubexpressionIndex α :=
  match s with
  | .declaration n =>
    { idx with byDeclaration := idx.byDeclaration.alter n (fun arr => some ((arr.getD #[]).push a)) }
  | .predicate p => { idx with predicates := idx.predicates.push (p, a) }

/--
Returns the tags of all subexpressions occurring in `type`. `usedConstants` must be the set of
constants occurring in `type`.
-/
def SubexpressionIndex.matching (idx : SubexpressionIndex α) (type : Expr)
    (usedConstants : NameSet) : Array α :=
  let result := usedConstants.foldl (init := #[]) fun result c =>
    match idx.byDeclaration[c]? with
    | some tags => result ++ tags
    | none => result
  idx.predicates.foldl (init := result) fun result (p, a) =>
    if p.matches type usedConstants then result.push a else result

@[inline]
def _root_.Vector.modify (v : Vector α n) (i : Nat) (f : α → α) : Vector α n :=
  ⟨v.toArray.modify i f, by simp⟩

/--
Computes the cell contents for all layers. Instead of checking every relevant constant against
every row and column value, every relevant constant is visited once, and the row and column values
it occurs in are found using a `SubexpressionIndex`.
-/
def getCells (config : Configuration) (layerIdentifiers : List Name)
    (possibleRowValues possibleColValues : Vector (Array Subexpression) layerIdentifiers.length) :
    LookupM (Vector (Array (CellDataForRowValue .subexpression .declaration layerIdentifiers possibleColValues)) layerIdentifiers.length) := do
  let relevantConstants ← collectRelevantConstants config layerIdentifiers

  -- Tags are pairs of the layer index and the index of the value within the layer.
  let mut columnIndex : SubexpressionIndex (Nat × Nat) := {}
  for hi : i in [0:layerIdentifiers.length] do
    for hj : j in [0:possibleColValues[i].size] do
      columnIndex := columnIndex.insert possibleColValues[i][j] (i, j)

  let mut rowIndex : SubexpressionIndex (Nat × Nat) := {}
  -- For every source layer, the cells of every possible row value in that layer.
  let mut cells : Array (Array (CellDataForRowValue .subexpression .declaration layerIdentifiers possibleColValues)) := #[]
  -- The target layers, in the same layout as `cells`.
  let mut targetLayers : Array (Array Nat) := #[]
  for hs : s in [0:layerIdentifiers.length] do
    let sourceLayer := layerIdentifiers[s]
    let mut cellsForLayer : Array (CellDataForRowValue .subexpression .declaration layerIdentifiers possibleColValues) := #[]
    let mut targetLayersForLayer : Array Nat := #[]
    for hr : r in [0:possibleRowValues[s].size] do
      let rowValue := possibleRowValues[s][r]
      let targetLayer ← rowValue.computeTargetNamespace sourceLayer layerIdentifiers
      let some targetLayerIndex := layerIdentifiers.findFinIdx? (· == targetLayer)
        | throwError "The target namespace {targetLayer} of {rowValue.toString} is not a layer of the table."
      cellsForLayer := cellsForLayer.push ⟨targetLayerIndex, Vector.replicate _ #[]⟩
      targetLayersForLayer := targetLayersForLayer.push targetLayerIndex
      rowIndex := rowIndex.insert rowValue (s, r)
    cells := cells.push cellsForLayer
    targetLayers := targetLayers.push targetLayersForLayer

  for ⟨name, type, usedConstants⟩ in relevantConstants do
    let matchingColumns := columnIndex.matching type usedConstants
    if matchingColumns.isEmpty then
      continue
    for (s, r) in rowIndex.matching type usedConstants do
      let targetLayer := targetLayers[s]![r]!
      for (i, j) in matchingColumns do
        if i == targetLayer then
          cells := cells.modify s (·.modify r fun d => { d with cells := d.cells.modify j (·.push name) })

  if h : cells.size = layerIdentifiers.length then
    return ⟨cells, h⟩
  else
    throwError "Internal error: unexpected number of layers."

end Classic

public def classic (layerIdentifiers : List Name) (config : Classic.Configuration := {}) :
    CellDataProvider .subexpression .subexpression .declaration layerIdentifiers where
  getById? id := pure (some id.toName)
  getCells := Classic.getCells config layerIdentifiers

end CellDataProvider

end Grove.Framework.Widget.Table
