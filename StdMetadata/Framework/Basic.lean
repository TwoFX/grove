/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Meta.Basic
import StdMetadata.Framework.Widget.Table.Basic
import StdMetadata.Framework.Widget.Assertion
import StdMetadata.Framework.Widget.ShowDeclaration

open Lean

namespace StdMetadata.Framework

open Widget


inductive Node where
  | «section» : String → String → Array Node → Node
  | «namespace» : Name → Node
  | associationTable [HasId α] [DisplayShort β] {l : List β} : AssociationTable α l → Node
  | table [DisplayShort δ] (l : List δ) : Table α β γ l → Node
  | assertion : Assertion → Node
  | showDeclaration : ShowDeclaration → Node
  | text : String → Node

instance : Coe Assertion Node where
  coe := .assertion

instance : Coe ShowDeclaration Node where
  coe := .showDeclaration

end StdMetadata.Framework
