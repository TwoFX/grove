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

def getCells (typeName : Lean.Name)
    (classNames : Vector (Array Lean.Name) 1)
    (parameterClassNames : Array Lean.Name) :
    LookupM (CellDataForRowValue .declaration .synthesis [()] classNames) := pure {
    targetLayerIndex := 0
    cells := classNames[0].toVector.map (fun className => #[{
      typeName
      className
      parameterClassNames
    }])
  }

end Synthesis

public def synthesis (parameterClassNames : Array Lean.Name) :
    CellDataProvider .declaration .declaration .synthesis [()] where
  getById? s := pure (Synthesis.Key.ofString? s)
  getCells possibleRowValues possibleColValues := do
    let rowValues := possibleRowValues[0]
    return #v[← rowValues.mapM (Synthesis.getCells · possibleColValues parameterClassNames)]

end Grove.Framework.Widget.Table.CellDataProvider
