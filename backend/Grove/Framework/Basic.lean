/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module
import Lean.Meta.Basic
public import Grove.Framework.Widget.Table.Basic
public import Grove.Framework.Widget.Assertion
public import Grove.Framework.Widget.ShowDeclaration
import Grove.Framework.Widget.State
public import Grove.Framework.Widget.Text
public import Grove.Framework.Git
public import Grove.Framework.Display

open Lean

namespace Grove.Framework

open Widget

public inductive Node where
  | «section» : String → String → Array Node → Node
  | «namespace» : Name → Node
  | associationTable {kind : DataKind} {β : Type} [HasId β] [DisplayShort β]
      {columnIdentifiers : List β} : AssociationTable kind columnIdentifiers → Node
  | table {rowKind columnKind cellKind : DataKind} {δ : Type} [BEq δ] [HasId δ] [DisplayShort δ]
      {layerIdentifiers : List δ} : Table rowKind columnKind cellKind layerIdentifiers → Node
  | assertion : Assertion → Node
  | showDeclaration : ShowDeclaration → Node
  | text : Text → Node

public instance : Coe Assertion Node where
  coe := .assertion

public instance : Coe ShowDeclaration Node where
  coe := .showDeclaration

public structure Project.Configuration where
  projectNamespace : Name
  getHash : IO String.Slice := getGitHash

public structure Project where
  config : Project.Configuration
  rootNode : Node
  renamings : Array (String × String)
  restoreState : RestoreStateM Unit

end Grove.Framework
