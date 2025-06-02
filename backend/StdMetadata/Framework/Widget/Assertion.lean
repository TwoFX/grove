/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Meta.Basic
import StdMetadata.Framework.Fact

open Lean

namespace StdMetadata.Framework.Widget

structure Assertion.Result where
  passed : Bool
  message : String

def Assertion.Result.success (message : String) : Assertion.Result :=
  ⟨true, message⟩

def Assertion.Result.failure (message : String) : Assertion.Result :=
  ⟨false, message⟩

structure Assertion where
  id : String
  title : String
  check : MetaM Assertion.Result

structure Assertion.Fact where
  assertionId : String
  metadata : Fact.Metadata

end StdMetadata.Framework.Widget
