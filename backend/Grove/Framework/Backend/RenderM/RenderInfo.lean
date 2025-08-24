/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.Reference
import Grove.JTD.Basic
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
  stateRepr : String

-- Parameterized by the data kind because `stateRepr` will differ depending on the data kind but
-- you can't see it from the string.
public inductive RenderInfo (kind : DataKind) where
  | decl : Name → RenderInfo kind
  | other : RenderInfo.Other kind → RenderInfo kind

public def _root_.Grove.Framework.PredicateSubexpression.renderInfo (p : PredicateSubexpression) :
    MetaM (RenderInfo .subexpression) :=
  return .other {
    value := p.key
    shortDescription := p.displayShort
    longDescription := p.displayShort
    reference := .none
    stateRepr := DataKind.subexpression.reprState (← Subexpression.state (.predicate p))
  }

def RenderInfo.ofName {kind : DataKind} (n : Name) : RenderM (RenderInfo kind) := do
  discard <| getDeclaration n
  return .decl n

public def RenderInfo.displayShort {kind : DataKind} : RenderInfo kind → String
  | .decl n => n.toString
  | .other o => o.shortDescription

def _root_.Grove.Framework.Subexpression.renderInfo : Subexpression → RenderM (RenderInfo .subexpression)
  | .declaration d => RenderInfo.ofName d
  | .predicate p => p.renderInfo

public def _root_.Grove.Framework.DataKind.renderInfo : (kind : DataKind) → kind.Key → RenderM (RenderInfo kind)
  | .declaration, d => RenderInfo.ofName d
  | .subexpression, s => s.renderInfo

end Grove.Framework.Backend.Full
