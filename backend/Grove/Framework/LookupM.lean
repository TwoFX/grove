/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Declaration.Name

open Lean

namespace Grove.Framework

structure LookupM.State where
  isAutoDeclCache : Std.HashMap Lean.Name Bool := ∅

namespace LookupM.State

def isAutoDecl (s : LookupM.State) (n : Name) : MetaM (LookupM.State × Bool) :=
  match s.isAutoDeclCache[n]? with
  | none => do
    let ans ← Name.computeIsAutoDecl n
    return ({ s with isAutoDeclCache := s.isAutoDeclCache.insert n ans }, ans)
  | some ans => do
      return (s, ans)

end LookupM.State

abbrev LookupM := StateRefT LookupM.State MetaM

def LookupM.modifyGetM {α β : Type} (f : LookupM.State → α → MetaM (LookupM.State × β)) (a : α) : LookupM β := do
  let oldState ← get
  set ({ } : LookupM.State)
  let (newState, result) ← f oldState a
  set newState
  return result

def isAutoDecl (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isAutoDecl n

def LookupM.run (f : LookupM α) : MetaM α :=
  StateRefT'.run' f { }

end Grove.Framework
