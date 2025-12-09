/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.Declaration.Basic
public import Grove.Framework.Widget.State
public import Std.Data.HashMap

open Lean

namespace Grove.Framework.Backend.Full

open Widget

section RenderM

public structure RenderState where
  declarations : Std.HashMap String Declaration := ∅

public def RenderState.getDeclaration (r : RenderState) (n : Name) : LookupM (RenderState × Declaration) :=
  match r.declarations.get? n.toString with
  | none => do
    let d ← Declaration.ofName n
    return ({ r with declarations := r.declarations.insert n.toString d }, d)
  | some d => return (r, d)

public abbrev RenderM := StateRefT RenderState (ReaderT SavedState LookupM)

def RenderM.modifyGetM {α β : Type} (f : RenderState → α → LookupM (RenderState × β)) (a : α) : RenderM β := do
  let oldState ← get
  set ({ } : RenderState)
  let (newState, result) ← f oldState a
  set newState
  return result

public def getDeclaration (n : Name) : RenderM Declaration :=
  RenderM.modifyGetM RenderState.getDeclaration n

public def RenderM.run {α : Type} (s : SavedState) (r : RenderM α) : MetaM (α × RenderState) :=
  (StateRefT'.run r { }).run s |>.run

end RenderM

end Grove.Framework.Backend.Full
