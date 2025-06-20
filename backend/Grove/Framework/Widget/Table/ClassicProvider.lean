/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Widget.Table.CellDataProvider
import Grove.Framework.Subexpression

open Lean

namespace Grove.Framework.Widget.Table

namespace CellDataProvider

def classic (layerIdentifiers : List Name) :
    CellDataProvider .subexpression .subexpression .declaration layerIdentifiers where
  getCells possibleRowValues possibleColValues := do
    sorry

end CellDataProvider

end Grove.Framework.Widget.Table
