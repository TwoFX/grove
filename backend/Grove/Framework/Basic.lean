/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Meta.Basic
import Grove.Framework.Widget.Table.Basic
import Grove.Framework.Widget.Assertion
import Grove.Framework.Widget.ShowDeclaration
import Grove.Framework.Widget.State
import Grove.Framework.Widget.Text
import Grove.Framework.Git

open Lean

namespace Grove.Framework

open Widget

inductive Node where
  | «section» : String → String → Array Node → Node
  | «namespace» : Name → Node
  | associationTable {kind : DataKind} {β : Type} [HasId β] [DisplayShort β]
      {columnIdentifiers : List β} : AssociationTable kind columnIdentifiers → Node
  | table {rowKind columnKind cellKind : DataKind} {δ : Type} [BEq δ] [HasId δ] [DisplayShort δ]
      {layerIdentifiers : List δ} : Table rowKind columnKind cellKind layerIdentifiers → Node
  | assertion : Assertion → Node
  | showDeclaration : ShowDeclaration → Node
  | text : Text → Node

instance : Coe Assertion Node where
  coe := .assertion

instance : Coe ShowDeclaration Node where
  coe := .showDeclaration

structure Project.Configuration where
  projectNamespace : Name
  getHash : IO String := getGitHash

structure Project where
  config : Project.Configuration
  rootNode : Node
  restoreState : RestoreStateM Unit

end Grove.Framework
