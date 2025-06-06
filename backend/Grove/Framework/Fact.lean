/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Meta.Basic
import Grove.JTD.Basic

open Lean

namespace Grove.Framework

open JTD

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

instance : ToString Status where
  toString
    | .done => "done"
    | .nothingToDo => "nothingToDo"
    | .believedGood => "believedGood"
    | .postponed => "postponed"
    | .bad => "bad"

instance : SchemaFor Status :=
  .enum "factStatus" [.done, .nothingToDo, .believedGood, .postponed, .bad]

structure Metadata where
  status : Status
  comment : String

instance : SchemaFor Metadata :=
  .structure "factMetadata" [.single "status" Metadata.status, .single "comment" Metadata.comment]

structure Invalidation where
  shortDescription : String
  longDescription : String

instance : SchemaFor Invalidation :=
  .structure "invalidation"
    [.single "shortDescription" Invalidation.shortDescription,
     .single "longDescription" Invalidation.longDescription]

inductive ValidationResult where
  | ok : ValidationResult
  | invalidated : Invalidation → ValidationResult

instance : SchemaFor ValidationResult :=
  .inductive "factValidationResult"
    [.nullary "ok" (fun | .ok => true | _ => false),
     .unary "invalidated" Invalidation (fun | .invalidated s => some s | _ => none)]

end Fact

class Fact (Widget : Type) (WidgetFact : outParam Type) where
  validate : Widget → WidgetFact → MetaM Fact.ValidationResult

end Grove.Framework
