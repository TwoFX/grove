/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Meta.Basic

open Lean

namespace StdMetadata.Framework.Widget.Table

structure CellDataForRow {δ : Type} (layerIdentifiers : List δ)
    (possibleValuesForColumns : Vector (Array β) layerIdentifiers.length) (γ : Type) where
  selectedLayer : δ
  cells : Array γ

structure CellDataProvider (α β γ : Type) (layerIdentifiers : List δ) where
  getCells :
    (possibleRowValues : Vector (Array α) layerIdentifiers.length) →
    (possibleColValues : Vector (Array β) layerIdentifiers.length) →
      MetaM (Vector (Array (CellDataForRow layerIdentifiers possibleColValues γ)) layerIdentifiers.length)

end StdMetadata.Framework.Widget.Table
