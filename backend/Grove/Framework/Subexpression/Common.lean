/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Subexpression.Basic

/-!
A library of useful subexpressions
-/

open Lean

namespace Grove.Framework

namespace Subexpression

def getElemGeneric (getElemConst : Name) (suffix : String) (containerType : Name) (indexType : Option Name) :
    PredicateSubexpression where
  displayShort := s!"{containerType.toString}[{indexType.map Name.toString |>.getD "·"}]{suffix}"
  predicate :=
    let withContainer := .app (.const getElemConst) (.appOf containerType)
    match indexType with
    | none => withContainer
    | some indexTy => .app withContainer (.appOf indexTy)
  computeTargetNamespace n _ := pure n

def getElem (containerType : Name) (indexType : Option Name := none) : Subexpression :=
  .predicate <| getElemGeneric ``GetElem.getElem "" containerType indexType

def getElem? (containerType : Name) (indexType : Option Name := none) : Subexpression :=
  .predicate <| getElemGeneric ``GetElem?.getElem? "?" containerType indexType

def getElem! (containerType : Name) (indexType : Option Name := none) : Subexpression :=
  .predicate <| getElemGeneric ``GetElem?.getElem! "!" containerType indexType

def emptyCollection (containerType : Name) : Subexpression :=
  .predicate {
    displayShort := "∅"
    predicate := .app (.const ``EmptyCollection.emptyCollection) (.appOf containerType)
    computeTargetNamespace n _ := pure n
  }

end Subexpression

end Grove.Framework
