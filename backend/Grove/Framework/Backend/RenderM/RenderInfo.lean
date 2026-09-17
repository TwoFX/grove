/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module

public import Grove.Framework.Reference
public import Grove.Framework.Backend.Data
public import Grove.Framework.Backend.RenderM.Basic
public import Lean.Meta.Basic
public import Grove.Framework.Subexpression.Basic
public import Grove.Framework.DataSource.Basic

open Lean

namespace Grove.Framework.Backend.Full

open JTD

public structure RenderInfo.Other (kind : DataKind) where
  value : String
  shortDescription : String
  longDescription : String
  reference : Reference
  stateJson : Data.StateSnapshot
  isDeprecated : Bool

-- Parameterized by the data kind of the options represented here.
public inductive RenderInfo (kind : DataKind) where
  /-- A declaration, given by its name rendered as a string. -/
  | decl : String → RenderInfo kind
  | other : RenderInfo.Other kind → RenderInfo kind

public def _root_.Grove.Framework.PredicateSubexpression.renderInfo (p : PredicateSubexpression) :
    LookupM (RenderInfo .subexpression) :=
  return .other {
    value := p.key
    shortDescription := p.displayShort
    longDescription := p.displayShort
    reference := .none
    stateJson := Data.StateSnapshot.ofState .subexpression (← Subexpression.state (.predicate p))
    isDeprecated := false
  }

public def _root_.Grove.Framework.Synthesis.Key.renderInfo (k : Synthesis.Key) :
    LookupM (RenderInfo .synthesis) := do
  let state ← Synthesis.State.of k
  return .other {
    value := k.toString
    shortDescription := state.displayShort
    longDescription := state.displayLong
    reference := .none
    stateJson := Data.StateSnapshot.ofState .synthesis state
    isDeprecated := false
  }

def RenderInfo.ofName {kind : DataKind} (n : Name) : RenderM (RenderInfo kind) :=
  .decl <$> registerDeclaration n

public def RenderInfo.displayShort {kind : DataKind} : RenderInfo kind → String
  | .decl n => n
  | .other o => o.shortDescription

def _root_.Grove.Framework.Subexpression.renderInfo : Subexpression → RenderM (RenderInfo .subexpression)
  | .declaration d => RenderInfo.ofName d
  | .predicate p => p.renderInfo

public def _root_.Grove.Framework.DataKind.renderInfo : (kind : DataKind) → kind.Key → RenderM (RenderInfo kind)
  | .declaration, d => RenderInfo.ofName d
  | .subexpression, s => s.renderInfo
  | .synthesis, s => s.renderInfo

end Grove.Framework.Backend.Full
