/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Lean.Meta.Basic
import Grove.Framework.Declaration.Name

open Lean

namespace Grove.Framework

public structure LookupM.State where
  private isAutoDeclCache : Std.HashMap Lean.Name Bool := ∅
  private isDeprecatedCache : Std.HashMap Lean.Name Bool := ∅
  private isTheoremCache : Std.HashMap Lean.Name Bool := ∅

namespace LookupM.State

def isAutoDecl (s : LookupM.State) (n : Name) : MetaM (LookupM.State × Bool) :=
  match s.isAutoDeclCache[n]? with
  | none => do
    let ans ← Name.computeIsAutoDecl n
    return ({ s with isAutoDeclCache := s.isAutoDeclCache.insert n ans }, ans)
  | some ans => pure (s, ans)

def isDeprecated (s : LookupM.State) (n : Name) : MetaM (LookupM.State × Bool) :=
  match s.isDeprecatedCache[n]? with
  | none => do
    let ans ← Name.computeIsDeprecated n
    return ({ s with isDeprecatedCache := s.isDeprecatedCache.insert n ans }, ans)
  | some ans => pure (s, ans)

def isTheorem (s : LookupM.State) (n : Name) : MetaM (LookupM.State × Bool) :=
  match s.isTheoremCache[n]? with
  | none => do
    let ans ← Name.computeIsTheorem n
    return ({ s with isTheoremCache := s.isTheoremCache.insert n ans }, ans)
  | some ans => pure (s, ans)

end LookupM.State

public abbrev LookupM := StateRefT LookupM.State MetaM

def LookupM.modifyGetM {α β : Type} (f : LookupM.State → α → MetaM (LookupM.State × β)) (a : α) : LookupM β := do
  let oldState ← get
  set ({ } : LookupM.State)
  let (newState, result) ← f oldState a
  set newState
  return result

public def isAutoDecl (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isAutoDecl n

public def isDeprecated (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isDeprecated n

public def isTheorem (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isTheorem n

public def LookupM.run (f : LookupM α) : MetaM α :=
  StateRefT'.run' f { }

end Grove.Framework
