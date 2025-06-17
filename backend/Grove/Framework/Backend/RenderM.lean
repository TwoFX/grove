/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Declaration
import Grove.Framework.Widget.State
import Lean.Meta.Basic

open Lean

namespace Grove.Framework.Backend.Full

open Widget

section RenderM

structure RenderState where
  declarations : Std.HashMap String Declaration := ∅

def RenderState.getDeclaration (r : RenderState) (n : Name) : MetaM (RenderState × Declaration) :=
  match r.declarations.get? n.toString with
  | none => do
    let d ← Declaration.ofName n
    return ({ r with declarations := r.declarations.insert n.toString d }, d)
  | some d => return (r, d)

abbrev RenderM := StateRefT RenderState (ReaderT SavedState MetaM)

def RenderM.modifyGetM {α β : Type} (f : RenderState → α → MetaM (RenderState × β)) (a : α) : RenderM β := do
  let oldState ← get
  set ({ } : RenderState)
  let (newState, result) ← f oldState a
  set newState
  return result

def getDeclaration (n : Name) : RenderM Declaration :=
  RenderM.modifyGetM RenderState.getDeclaration n

def getSavedState : RenderM SavedState :=
  readThe SavedState

def RenderM.findAssociationTable? (kind : DataKind) (widgetId : String) :
    RenderM (Option (AssociationTable.Data kind)) := do
  let savedData := (← getSavedState).getAssociationTable widgetId kind
  match savedData with
  | .error .incompatibleDataKind => return none -- could warn here :shrug:
  | .ok maybeTable => return maybeTable

def RenderM.run {α : Type} (s : SavedState) (r : RenderM α) : MetaM (α × RenderState) :=
  (StateRefT'.run r { }).run s

end RenderM

end Grove.Framework.Backend.Full
