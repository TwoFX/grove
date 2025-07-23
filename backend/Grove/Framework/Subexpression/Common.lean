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

def homogeneousBinaryOperator (const : Name) (notation_ : String) (type : Name) : PredicateSubexpression where
  displayShort := s!"{type} {notation_} {type}"
  predicate := .app3 (.const const) (.appOf type) (.appOf type) (.appOf type)
  computeTargetNamespace n _ := pure n

def add (type : Name) : Subexpression :=
  .predicate <| homogeneousBinaryOperator ``HAdd.hAdd "+" type

def sub (type : Name) : Subexpression :=
  .predicate <| homogeneousBinaryOperator ``HSub.hSub "-" type

def mul (type : Name) : Subexpression :=
  .predicate <| homogeneousBinaryOperator ``HMul.hMul "*" type

def div (type : Name) : Subexpression :=
  .predicate <| homogeneousBinaryOperator ``HDiv.hDiv "/" type

def mod (type : Name) : Subexpression :=
  .predicate <| homogeneousBinaryOperator ``HMod.hMod "%" type

end Subexpression

end Grove.Framework
