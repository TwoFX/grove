/-
Copyright (c) 2026 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module
public import Grove.Framework.Synthesis.Impl

open Lean Meta

namespace Grove.Framework

namespace Synthesis

public structure Key where
  typeName : Lean.Name
  className : Lean.Name
  parameterClassNames : Array Lean.Name
deriving Inhabited, BEq, Repr, ToJson, FromJson

public def Key.toString (key : Key) : String :=
  (toJson key).pretty

public def Key.ofString? (str : String) : Option Key :=
  Except.toOption (Json.parse str >>= fromJson?)

public structure State where
  result? : Option Result
deriving BEq, Repr

public def State.of (key : Key) : LookupM State :=
  (⟨·⟩) <$> trySynthesize key.typeName key.className key.parameterClassNames

public def State.repr (state : State) : String :=
  (_root_.repr state).pretty

public def State.displayShort (state : State) : String :=
  state.result?.map (·.displayShort) |>.getD "Synthesis failed"

public def State.displayLong (state : State) : String :=
  state.result?.map (·.displayLong) |>.getD "Synthesis failed"


public def State.describeDifferences (first second : State) : Option String :=
  -- TODO
  none

end Synthesis

end Grove.Framework
