/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Widget.Table.CellDataProvider
import Grove.Framework.Subexpression

open Lean

namespace Grove.Framework.Widget.Table

open DataSource

namespace CellDataProvider

namespace Classic

-- Target namespace overrides, ...
structure Configuration where
  relevantNamespaces : Option (List Name) := none
  declarationPredicate : DeclarationPredicate := .true

structure RelevantConstant where
  name : Name
  type : Expr
  usedConstants : NameSet

structure ColumnCache (layerIdentifiers : List Name)
    (possibleColValues : Vector (Array Subexpression) layerIdentifiers.length) where
  columnCache : Std.HashMap Name (Std.DHashMap (Fin layerIdentifiers.length) (fun layerIndex => Array (Fin possibleColValues[layerIndex].size)))
  relevantConstants : Array RelevantConstant

def buildColumnCache (config : Configuration) (layerIdentifiers : List Name) (possibleColValues : Vector (Array Subexpression) layerIdentifiers.length) :
    LookupM (ColumnCache layerIdentifiers possibleColValues) := do
  let mut columnCache := ∅
  let mut relevantConstants := #[]

  let relevantNamespaces := config.relevantNamespaces.getD layerIdentifiers

  let pred := DeclarationPredicate.notInternal.and config.declarationPredicate

  for (name, constantInfo) in (← getEnv).constants do
    if !(← pred.check name constantInfo) then
      continue

    if !relevantNamespaces.any (fun pref => pref.isPrefixOf name) then
      continue

    let e := constantInfo.type
    let usedConstants := e.getUsedConstantsAsSet
    relevantConstants := relevantConstants.push ⟨name, e, usedConstants⟩
    let mut cacheForName := ∅
    for hi : i in [0:layerIdentifiers.length] do
      for hj : j in [0:possibleColValues[i].size] do
        let subexpression := possibleColValues[i][j]
        if subexpression.matches e usedConstants then
          cacheForName := cacheForName.alter ⟨i, hi.upper⟩
            (fun arr => (arr.getD #[]).push ⟨j, hj.upper⟩)
    if !cacheForName.isEmpty then
      columnCache := columnCache.insert name cacheForName

  return ⟨columnCache, relevantConstants⟩

@[inline]
def _root_.Vector.modify (v : Vector α n) (i : Nat) (f : α → α) : Vector α n :=
  ⟨v.toArray.modify i f, by simp⟩

def cellDataForSourceExpression {layerIdentifiers : List Name} {possibleColValues : Vector (Array Subexpression) layerIdentifiers.length}
    (columnCache : ColumnCache layerIdentifiers possibleColValues) (sourceLayer : Name) (sourceExpression : Subexpression) :
    MetaM (CellDataForRowValue .subexpression .declaration layerIdentifiers possibleColValues) := do
  let targetLayer ← sourceExpression.computeTargetNamespace sourceLayer layerIdentifiers
  let some targetLayerIndex := layerIdentifiers.findFinIdx? (fun l => l == targetLayer)
    | failure

  let mut cells : Vector (Array Name) possibleColValues[targetLayerIndex].size := Vector.replicate _ #[]

  for ⟨name, e, usedConstants⟩ in columnCache.relevantConstants do
    if sourceExpression.matches e usedConstants then
      if let some cacheForName := columnCache.columnCache[name]? then
        if let some cacheForLayer := cacheForName.get? targetLayerIndex then
          if name.toString == "Std.DHashMap.Internal.Raw₀.Const.getD_eq_getValueD" then
            IO.println s!"{name} matches {sourceExpression.toString}"
          for columnIndex in cacheForLayer do
            cells := cells.modify columnIndex (·.push name)

  return ⟨targetLayerIndex, cells⟩

def cellDataForSourceLayer {layerIdentifiers : List Name}
    {possibleColValues : Vector (Array Subexpression) layerIdentifiers.length}
    (columnCache : ColumnCache layerIdentifiers possibleColValues)
    (possibleRowValues : Array Subexpression) (sourceLayer : Name) :
    MetaM (Array (CellDataForRowValue .subexpression .declaration layerIdentifiers possibleColValues)) :=
  possibleRowValues.mapM (cellDataForSourceExpression columnCache sourceLayer)

end Classic

def classic (layerIdentifiers : List Name) (config : Classic.Configuration := {}) :
    CellDataProvider .subexpression .subexpression .declaration layerIdentifiers where
  getById? id := pure (some id.toName)
  getCells possibleRowValues possibleColValues := do
    let columnCache ← Classic.buildColumnCache config layerIdentifiers possibleColValues
    possibleRowValues.mapFinIdxM (fun idx rowValues hidx =>
      Classic.cellDataForSourceLayer columnCache rowValues layerIdentifiers[idx])

end CellDataProvider

end Grove.Framework.Widget.Table
