/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.DataSource.Basic

open Lean

namespace Grove.Framework.Widget.Table

/-- Here you should imagine that we have fixed a source layer `d` and a possible value `r` for
    the row value. Then we still need to give a target layer `d'`, and for every possible column
    value `c` of `d'`, a collection of cells.
     -/
public structure CellDataForRowValue (columnKind cellKind : DataKind) {δ : Type} (layerIdentifiers : List δ)
    (possibleValuesForColumns : Vector (Array columnKind.Key) layerIdentifiers.length) where
  targetLayerIndex : Fin layerIdentifiers.length
  cells : Vector (Array cellKind.Key) possibleValuesForColumns[targetLayerIndex].size

public structure CellDataProvider (rowKind columnKind cellKind : DataKind) {δ : Type} (layerIdentifiers : List δ) : Type where
  getById? : String → LookupM (Option cellKind.Key)
  getCells :
    -- For every layer, get a list of possible row and column values
    (possibleRowValues : Vector (Array rowKind.Key) layerIdentifiers.length) →
    (possibleColValues : Vector (Array columnKind.Key) layerIdentifiers.length) →
      -- The array ranges over all possible row values in the given layer (we cannot express this in
      -- types because there is no `DVector`).
      LookupM (Vector (Array (CellDataForRowValue columnKind cellKind layerIdentifiers possibleColValues)) layerIdentifiers.length)

end Grove.Framework.Widget.Table
