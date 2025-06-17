/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Widget.ShowDeclaration
import Grove.Framework.Widget.AssociationTable.Basic
import Std.Data.HashMap.Basic

open Std

open Grove.Framework Widget

namespace Grove.Framework

structure SavedState where
  showDeclarationFacts : HashMap String (Array ShowDeclaration.Fact) := ∅
  associationTables : HashMap String (Sigma AssociationTable.Data) := ∅

abbrev RestoreStateM := StateM SavedState

def RestoreStateM.run (c : RestoreStateM Unit) : SavedState :=
  (StateT.run c {}).2

@[inline]
private def addToMap (m : HashMap String (Array α)) (id : String) (a : α) : HashMap String (Array α) :=
  m.alter id (fun arr => some ((arr.getD #[]).push a))

def addShowDeclarationFact (f : ShowDeclaration.Fact) : RestoreStateM Unit :=
  modify (fun s => { s with showDeclarationFacts := addToMap s.showDeclarationFacts f.widgetId f })

def addAssociationTable {kind : DataKind} (a : AssociationTable.Data kind) : RestoreStateM Unit :=
  modify (fun s => { s with associationTables := s.associationTables.insert a.widgetId ⟨_, a⟩ })

inductive RestoreError where
  /-- The widget expects to contain a certain kind of data, but the saved data is of a different
      kind. -/
  | incompatibleDataKind : RestoreError

def SavedState.getAssociationTable (s : SavedState) (widgetId : String) (kind : DataKind) :
    Except RestoreError (Option (AssociationTable.Data kind)) :=
  match s.associationTables[widgetId]? with
  | none => Except.ok none
  | some ⟨k, d⟩ =>
    if h : k = kind then
      Except.ok <| some <| cast (h ▸ rfl) d
    else
      Except.error .incompatibleDataKind

end Grove.Framework
