/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Fact

namespace Grove.Framework.Widget.Assertion

structure Result where
  assertionId : String
  description : String
  passed : Bool
  message : String

structure Fact where
  widgetId : String
  factId : String
  assertionId : String
  state : Assertion.Result
  metadata : Fact.Metadata

structure Data where
  widgetId : String
  facts : Array Assertion.Fact

end Grove.Framework.Widget.Assertion
