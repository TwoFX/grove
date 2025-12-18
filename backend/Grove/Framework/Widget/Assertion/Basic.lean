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

/--
In `AssertM`, we have access to
* the `MetaM` monad
* the current content of widgets (via `findAssociationTable?` and similar functions)
* cached meta information that may be expensive to compute (via `isAutoDecl` and similar functions, see `LookupM`)
* the current set of renamings (via `migrateName`)
-/
public abbrev AssertM := ReaderT RestoreContext (ReaderT SavedState LookupM)

public structure Assertion where
  widgetId : String
  title : String
  description : String
  unassertedFactMode : UnassertedFactMode := .doNothing
  /--
  When restoring assertion facts, this function is applied to the ID. This is useful if the
  assertion ID is an identifier or derived from it, so that facts about a declaration are
  transferred automatically if the declaration is renamed.

  In fact, the default value of this field is the `migrateName` function, which replaces exact
  matches of identifiers that are being renamed with their new name.
  -/
  migrateAssertionId : String → AssertM String := migrateName
  check : AssertM (Array Assertion.Result)

end Grove.Framework.Widget
