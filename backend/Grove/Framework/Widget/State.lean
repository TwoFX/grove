/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.Widget.ShowDeclaration
public import Grove.Framework.Widget.AssociationTable.Basic
public import Grove.Framework.Widget.Table.Basic
public import Grove.Framework.Widget.Assertion.Fact
public import Std.Data.HashMap.Basic

open Std

open Grove.Framework Widget

namespace Grove.Framework

-- TODO: make fields and imports private after https://github.com/leanprover/lean4/issues/10099 is fixed
public structure SavedState where
  showDeclarationFacts : HashMap String (Array ShowDeclaration.Fact) := ∅
  associationTables : HashMap String (Sigma AssociationTable.Data) := ∅
  tables : HashMap String (Σ k₁ k₂ k₃, Table.Data k₁ k₂ k₃) := ∅
  assertions : HashMap String Assertion.Data := ∅

public abbrev RestoreStateM := StateM SavedState

public def RestoreStateM.run (c : RestoreStateM Unit) : SavedState :=
  (StateT.run c {}).2

@[inline]
private def addToMap (m : HashMap String (Array α)) (id : String) (a : α) : HashMap String (Array α) :=
  m.alter id (fun arr => some ((arr.getD #[]).push a))

public def addShowDeclarationFact (f : ShowDeclaration.Fact) : RestoreStateM Unit :=
  modify (fun s => { s with showDeclarationFacts := addToMap s.showDeclarationFacts f.widgetId f })

public def addAssociationTable {kind : DataKind} (a : AssociationTable.Data kind) : RestoreStateM Unit :=
  modify (fun s => { s with associationTables := s.associationTables.insert a.widgetId ⟨_, a⟩ })

public def addTable {k₁ k₂ k₃ : DataKind} (a : Table.Data k₁ k₂ k₃) : RestoreStateM Unit :=
  modify (fun s => { s with tables := s.tables.insert a.widgetId ⟨_, _, _, a⟩ })

public def addAssertion (d : Assertion.Data) : RestoreStateM Unit :=
  modify (fun s => { s with assertions := s.assertions.insert d.widgetId d })

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

def SavedState.getTable (s : SavedState) (widgetId : String) (k₁ k₂ k₃ : DataKind) :
    Except RestoreError (Option (Table.Data k₁ k₂ k₃)) :=
  match s.tables[widgetId]? with
  | none => Except.ok none
  | some ⟨k₁', k₂', k₃', d⟩ =>
    if h : k₁ = k₁' ∧ k₂ = k₂' ∧ k₃ = k₃' then
      Except.ok <| some <| cast (h.1 ▸ h.2.1 ▸ h.2.2 ▸ rfl) d
    else
      Except.error .incompatibleDataKind

def SavedState.getAssertion (s : SavedState) (widgetId : String) : Option Assertion.Data :=
  s.assertions[widgetId]?

def getSavedState {m : Type → Type} [Monad m] [MonadReaderOf SavedState m] : m SavedState :=
  readThe SavedState

public def findAssociationTable? {m : Type → Type} [Monad m] [MonadReaderOf SavedState m] (kind : DataKind)
    (widgetId : String) : m (Option (AssociationTable.Data kind)) := do
  let savedData := (← getSavedState).getAssociationTable widgetId kind
  match savedData with
  | .error .incompatibleDataKind => return none -- could warn here :shrug:
  | .ok maybeTable => return maybeTable

public def findTable? {m : Type → Type} [Monad m] [MonadReaderOf SavedState m]
    (rowKind columnKind cellKind : DataKind) (widgetId : String) :
    m (Option (Table.Data rowKind columnKind cellKind)) := do
  let savedData := (← getSavedState).getTable widgetId rowKind columnKind cellKind
  match savedData with
  | .error .incompatibleDataKind => return none -- could warn here :shrug:
  | .ok maybeTable => return maybeTable

-- TODO: make this more type-safe
public def valuesInAssociationTable {m : Type → Type} [Monad m] [MonadReaderOf SavedState m]
    {β : Type} {columnIdentifiers : List β}
    {kind : DataKind} (table : AssociationTable kind columnIdentifiers) : m (Array String) := do
  let some table ← findAssociationTable? kind table.id | return #[]
  return table.rows.flatMap (fun row => row.columns.map (·.cellValue))

public def findAssertion? {m : Type → Type} [Monad m] [MonadReaderOf SavedState m] (widgetId : String) :
    m (Option Assertion.Data) :=
  return (← getSavedState).getAssertion widgetId

public def findShowDeclarationFacts? {m : Type → Type} [Monad m] [MonadReaderOf SavedState m]
    (id : String) : m (Option (Array ShowDeclaration.Fact)) := do
  return (← getSavedState).showDeclarationFacts[id]?

end Grove.Framework
