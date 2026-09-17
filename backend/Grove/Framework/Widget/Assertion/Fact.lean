/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module

public import Grove.Framework.Fact

open Lean

namespace Grove.Framework.Widget.Assertion

public structure Result where
  assertionId : String
  description : String
  passed : Bool
  message : String
deriving ToJson, FromJson

public structure Fact where
  widgetId : String
  factId : String
  assertionId : String
  state : Assertion.Result
  metadata : Fact.Metadata
deriving ToJson, FromJson

public structure Data where
  widgetId : String
  facts : Array Assertion.Fact
deriving ToJson, FromJson

end Grove.Framework.Widget.Assertion
