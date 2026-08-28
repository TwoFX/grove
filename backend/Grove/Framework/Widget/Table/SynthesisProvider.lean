/-
Copyright (c) 2026 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module

public import Grove.Framework.Widget.Table.CellDataProvider

open Lean

namespace Grove.Framework.Widget.Table.CellDataProvider

namespace Synthesis

def keyIfSynthesizable (typeName className : Lean.Name) (parameterClassNames : Array Lean.Name) :
    LookupM (Option Synthesis.Key) := do
  let k : Synthesis.Key := {
    typeName
    className
    parameterClassNames
  }
  -- Missing Option.guardM
  if (← Synthesis.State.of k).result?.isSome then
    return some k
  else
    return none


def getCells (typeName : Lean.Name)
    (classNames : Vector (Array Lean.Name) 1)
    (parameterClassNames : Array Lean.Name) :
    LookupM (CellDataForRowValue .declaration .synthesis [()] classNames) := do
  return {
    targetLayerIndex := 0
    cells := ← classNames[0].toVector.mapM (fun className =>
      return (← keyIfSynthesizable typeName className parameterClassNames).toArray)
  }

end Synthesis

public def synthesis (parameterClassNames : Array Lean.Name) :
    CellDataProvider .declaration .declaration .synthesis [()] where
  getById? s := pure (Synthesis.Key.ofString? s)
  getCells possibleRowValues possibleColValues := do
    let rowValues := possibleRowValues[0]
    return #v[← rowValues.mapM (Synthesis.getCells · possibleColValues parameterClassNames)]

end Grove.Framework.Widget.Table.CellDataProvider
