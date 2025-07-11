/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Meta.Basic
import Grove.Framework.Widget.State
import Grove.Framework.Widget.Assertion.Fact

open Lean

namespace Grove.Framework.Widget

def Assertion.Result.success (assertionId description message : String) : Assertion.Result :=
  ⟨assertionId, description, true, message⟩

def Assertion.Result.failure (assertionId description message : String) : Assertion.Result :=
  ⟨assertionId, description, false, message⟩

abbrev AssertM := ReaderT SavedState MetaM

structure Assertion where
  widgetId : String
  title : String
  description : String
  check : AssertM (Array Assertion.Result)

end Grove.Framework.Widget
