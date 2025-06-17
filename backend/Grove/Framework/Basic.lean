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
import Grove.Framework.Git

open Lean

namespace Grove.Framework

open Widget

inductive Node where
  | «section» : String → String → Array Node → Node
  | «namespace» : Name → Node
  | associationTable {β : Type} [HasId β] [DisplayShort β] {columnIdentifiers : List β} :
      AssociationTable kind columnIdentifiers → Node
  | assertion : Assertion → Node
  | showDeclaration : ShowDeclaration → Node
  | text : String → Node

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
