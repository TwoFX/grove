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

structure RenderInfo.Other where
  value : String
  shortDescription : String
  longDescription : String
  reference : Reference
  stateRepr : String

inductive RenderInfo where
  | decl : Name → RenderInfo
  | other : RenderInfo.Other → RenderInfo

def _root_.Grove.Framework.PredicateSubexpression.renderInfo (p : PredicateSubexpression) : RenderInfo :=
  .other {
    value := p.key
    shortDescription := p.displayShort
    longDescription := p.displayShort
    reference := .none
    stateRepr := p.key
  }

def RenderInfo.ofName (n : Name) : RenderM RenderInfo := do
  discard <| getDeclaration n
  return .decl n

def _root_.Grove.Framework.Subexpression.renderInfo : Subexpression → RenderM RenderInfo
  | .declaration d => RenderInfo.ofName d
  | .predicate p => pure p.renderInfo

def _root_.Grove.Framework.DataKind.renderInfo : (kind : DataKind) → kind.Key → RenderM RenderInfo
  | .declaration, d => RenderInfo.ofName d
  | .subexpression, s => s.renderInfo

end Grove.Framework.Backend.Full
