/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Subexpression.Common
import Grove.Framework.DataSource.Basic

/-!
A library of useful data sources
-/

open Lean

namespace Grove.Framework

namespace DataSource

def getElem (containerType : Name) (indexType : Option Name := none) : DataSource .subexpression :=
  .ofArray #[
    Subexpression.getElem containerType indexType,
    Subexpression.getElem? containerType indexType,
    Subexpression.getElem! containerType indexType,
  ]

end DataSource

end Grove.Framework
