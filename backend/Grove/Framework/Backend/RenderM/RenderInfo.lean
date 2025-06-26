/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Reference
import Grove.JTD.Basic
import Grove.Framework.Backend.RenderM.Basic

open Lean

namespace Grove.Framework.Backend.Full

open JTD

structure RenderInfo.Other (kind : DataKind) where
  value : String
  shortDescription : String
  longDescription : String
  reference : Reference
  stateRepr : String

-- Parameterized by the data kind because `stateRepr` will differ depending on the data kind but
-- you can't see it from the string.
inductive RenderInfo (kind : DataKind) where
  | decl : Name → RenderInfo kind
  | other : RenderInfo.Other kind → RenderInfo kind

def _root_.Grove.Framework.PredicateSubexpression.renderInfo (p : PredicateSubexpression) :
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

def _root_.Grove.Framework.Subexpression.renderInfo : Subexpression → RenderM (RenderInfo .subexpression)
  | .declaration d => RenderInfo.ofName d
  | .predicate p => p.renderInfo

def _root_.Grove.Framework.DataKind.renderInfo : (kind : DataKind) → kind.Key → RenderM (RenderInfo kind)
  | .declaration, d => RenderInfo.ofName d
  | .subexpression, s => s.renderInfo

end Grove.Framework.Backend.Full
