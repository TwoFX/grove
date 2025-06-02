/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Meta.Basic

open Lean

namespace StdMetadata.Framework

namespace Fact

inductive Status where
  /-- This is confirmed good. -/
  | done
  /-- This is confirmed good because there is nothing to do. -/
  | nothingToDo
  /-- This has been addressed in a commit that the tool can't see yet. -/
  | believedGood
  /-- This is known bad but there aren't really plans to do anything about it. -/
  | postponed
  /-- This is known bad. -/
  | bad
deriving ToJson

structure Metadata where
  status : Status
  comment : String
deriving ToJson

inductive ValidationResult where
  | ok : ValidationResult
  | invalidated : String → ValidationResult
deriving ToJson

end Fact

class Fact (Widget : Type) (WidgetFact : outParam Type) where
  validate : Widget → WidgetFact → MetaM Fact.ValidationResult

end StdMetadata.Framework
