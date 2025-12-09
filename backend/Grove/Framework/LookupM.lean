/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Lean.Meta.Basic
import Grove.Framework.Declaration.Name
import Lean.Meta.Instances
public import Grove.Framework.NameTrie

open Lean

namespace Grove.Framework

public structure LookupM.State where
  private isAutoDeclCache : Std.HashMap Lean.Name Bool := ∅
  private isDeprecatedCache : Std.HashMap Lean.Name Bool := ∅
  private isTheoremCache : Std.HashMap Lean.Name Bool := ∅
  private isInstanceCache : Std.HashMap Lean.Name Bool := ∅
  private declarationsTrie : NameTrie Unit

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

def isInstance (s : LookupM.State) (n : Name) : MetaM (LookupM.State × Bool) :=
  match s.isInstanceCache[n]? with
  | none => do
    let ans ← Meta.isInstance n
    return ({ s with isInstanceCache := s.isInstanceCache.insert n ans }, ans)
  | some ans => pure (s, ans)

end LookupM.State

public abbrev LookupM := StateRefT LookupM.State MetaM

def LookupM.modifyGetM {α β : Type} (f : LookupM.State → α → MetaM (LookupM.State × β)) (a : α) : LookupM β := do
  let oldState ← get
  set ({ declarationsTrie := .empty } : LookupM.State)
  let (newState, result) ← f oldState a
  set newState
  return result

public def isAutoDecl (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isAutoDecl n

public def isDeprecated (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isDeprecated n

public def isTheorem (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isTheorem n

public def isInstance (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isInstance n

public def allDeclarations : LookupM (NameTrie Unit) := do
  return (← get).declarationsTrie

public def inNamespace (n : Name) : LookupM (Array Name) := do
  return (← get).declarationsTrie.inNamespace n

private def constructTrie : MetaM (NameTrie Unit) := do
  return (← getEnv).constants.fold (init := NameTrie.empty) (fun t n _ => t.insert n ())

public def LookupM.run (f : LookupM α) : MetaM α := do
  StateRefT'.run' f { declarationsTrie := ← constructTrie }

end Grove.Framework
