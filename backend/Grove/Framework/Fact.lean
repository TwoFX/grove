/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

import Lean.Meta.Basic
public import Grove.JTD.Basic

open Lean

namespace Grove.Framework

open JTD

namespace Fact

public inductive Status where
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

@[no_expose]
public instance : SchemaFor Status :=
  .enum "factStatus" [.done, .nothingToDo, .believedGood, .postponed, .bad]

public structure Metadata where
  status : Status
  comment : String

public instance : SchemaFor Metadata :=
  .structure "factMetadata" [.single "status" Metadata.status, .single "comment" Metadata.comment]

public structure Invalidation where
  shortDescription : String
  longDescription : String

public instance : SchemaFor Invalidation :=
  .structure "invalidation"
    [.single "shortDescription" Invalidation.shortDescription,
     .single "longDescription" Invalidation.longDescription]

public inductive ValidationResult where
  | new : ValidationResult
  | ok : ValidationResult
  | invalidated : Invalidation → ValidationResult

public instance : SchemaFor ValidationResult :=
  .inductive "factValidationResult"
    [.nullary "new" (fun | .new => true | _ => false),
     .nullary "ok" (fun | .ok => true | _ => false),
     .unary "invalidated" Invalidation (fun | .invalidated s => some s | _ => none)]

end Fact

public class ValidatedFact (α : Type) where
  widgetId : α → String
  factId : α → String
  validationResult : α → Fact.ValidationResult

end Grove.Framework
