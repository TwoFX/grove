/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

import Grove.Framework.Subexpression.Common
public import Grove.Framework.DataSource.Basic

/-!
A library of useful data sources
-/

open Lean

namespace Grove.Framework

namespace DataSource

public def getElem (containerType : Name) (indexType : Option Name := none) : DataSource .subexpression :=
  .ofArray #[
    Subexpression.getElem containerType indexType,
    Subexpression.getElem? containerType indexType,
    Subexpression.getElem! containerType indexType,
  ]

public def binaryArithmetic (type : Name) : DataSource .subexpression :=
  .ofArray #[
    Subexpression.add type,
    Subexpression.sub type,
    Subexpression.mul type,
    Subexpression.div type,
    Subexpression.mod type,
  ]

public def emptyCollection (containerType : Name) : DataSource .subexpression :=
  .ofArray #[Subexpression.emptyCollection containerType]

end DataSource

end Grove.Framework
