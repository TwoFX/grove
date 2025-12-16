/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

import Lean.Meta.Basic
public import Grove.Framework.Widget.State
public import Grove.Framework.Widget.Assertion.Fact

open Lean

namespace Grove.Framework.Widget

public def Assertion.Result.success (assertionId description message : String) : Assertion.Result :=
  ⟨assertionId, description, true, message⟩

public def Assertion.Result.failure (assertionId description message : String) : Assertion.Result :=
  ⟨assertionId, description, false, message⟩

public abbrev AssertM := ReaderT SavedState LookupM

public structure Assertion where
  widgetId : String
  title : String
  description : String
  unassertedFactMode : UnassertedFactMode := .doNothing
  check : AssertM (Array Assertion.Result)

end Grove.Framework.Widget
