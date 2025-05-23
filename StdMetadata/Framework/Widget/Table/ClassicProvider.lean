/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Framework.Widget.Table.CellDataProvider
import StdMetadata.Framework.Subexpression

namespace StdMetadata.Framework.Widget.Table

namespace CellDataProvider

def classic (layerIdentifiers : List Name) : CellDataProvider Subexpression Subexpression Declaration layerIdentifiers where
  getCells possibleRowValues possibleColValues := do
    sorry

end CellDataProvider

end StdMetadata.Framework.Widget.Table
