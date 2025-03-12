/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Prototype.Name
import Lean
import Std.Data.TreeSet

open Lean

namespace Std.TreeSet

def any? (m : TreeSet α cmp) : Option α := Id.run do
  for a in m do
    return some a
  return none

end Std.TreeSet

namespace StdMetadata.Prototype

inductive SearchKey where
  | byName : Name → SearchKey
  | byExpr : Expr → SearchKey

def SearchKey.toString : SearchKey → String
  | byName n => n.toString
  | byExpr e => e.dbgToString

structure DeclarationInfo where
  fullName : Name
  displayName : String
  longDisplayName : String
  searchKey : SearchKey
  fromNamespace : Name
  returnNamespace : Option Name

instance : ToString DeclarationInfo where
  toString declInfo := s!"{declInfo.longDisplayName} -> {declInfo.returnNamespace} @ {declInfo.searchKey.toString}"

def DeclarationInfo.key (declInfo : DeclarationInfo) : String :=
  declInfo.searchKey.toString

def getNamesAppearingInForallBinderTypes (names : NameSet) : Expr → Std.TreeSet Name Name.quickCmp
  | Expr.forallE _ binderType body _ =>
    let namesAppearingInBinderType := binderType.getUsedConstants.filter names.contains
    getNamesAppearingInForallBinderTypes names body |>.insertMany namesAppearingInBinderType
  | _ => ∅

def computeOriginNamespace (info : ConstantInfo) (ownNamespace : Name) (allNamespaces : NameSet) : Option Name :=
  let possible := getNamesAppearingInForallBinderTypes allNamespaces info.type
  if ownNamespace ∈ possible then
    some ownNamespace
  else
    possible.any?

def computeReturnNamespace (info : ConstantInfo) (allNamespaces : NameSet) : Option Name :=
  info.type.getForallBody.getUsedConstants.find? allNamespaces.contains

def originNamespaceOverride : NameMap Name :=
  .ofList [
    (``BitVec.ofFin, ``Fin),
    (``BitVec.intMin, ``BitVec),
    (``BitVec.intMax, ``BitVec)
  ]

 def targetNamespaceOverride : NameMap (Option Name) :=
  .ofList [
    (``BitVec.sle, some ``BitVec),
    (``BitVec.slt, some ``BitVec)
  ]

def DeclarationInfo.within? (namesp name : Name) (info : ConstantInfo) (allNamespaces : NameSet) : Option DeclarationInfo :=
  let fromNamespace := originNamespaceOverride.find? name |>.orElse (fun _ => computeOriginNamespace info namesp allNamespaces) |>.getD namesp
  let displayName := Name.dropPrefix? fromNamespace name |>.getD name
  if displayName.getNumParts = 0 || (`Raw).isPrefixOf displayName ||
      (`Internal).isPrefixOf displayName then
    none
  else
    some {
      fromNamespace
      fullName := name
      longDisplayName := name.toString
      displayName := displayName.toString
      searchKey := .byName name
      returnNamespace := targetNamespaceOverride.find? name |>.getD (computeReturnNamespace info allNamespaces)
    }

def mkHomogeneousBinary (op type : Name) : Expr :=
  mkApp3 (mkConst op [.zero, .zero, .zero]) (mkConst type) (mkConst type) (mkConst type)

def DeclarationInfo.ofHomogeneousBinary (operation namesp : Name) : DeclarationInfo where
  fullName := operation
  displayName := operation.toString ++ " (" ++ namesp.toString ++ ")"
  longDisplayName := operation.toString ++ " (" ++ namesp.toString ++ ")"
  searchKey := .byExpr (mkHomogeneousBinary operation namesp)
  fromNamespace := namesp
  returnNamespace := some namesp

def mkHomogeneousUnary (op type : Name) : Expr :=
  mkApp (mkConst op [.zero]) (mkConst type)

def DeclarationInfo.ofUnary (operation fromType opType : Name) (toType : Option Name) : DeclarationInfo :=
  let displayName := operation.toString ++ " (" ++ fromType.toString ++ (toType.map (" -> " ++ ·.toString) |>.getD "") ++ ")"
  { fullName := operation
    displayName
    longDisplayName := displayName
    searchKey := .byExpr (mkHomogeneousUnary operation opType)
    fromNamespace := fromType
    returnNamespace := toType }

def getBinaryOperatorDeclarationInfos (namespaces : Array Name) : Array DeclarationInfo := Id.run do
  let mut result := #[]

  for namesp in namespaces do
    for cls in binaryOperators do
      result := result.push (DeclarationInfo.ofHomogeneousBinary cls namesp)

  return result
where binaryOperators : Array Name :=
  #[``HAnd.hAnd, ``HOr.hOr, ``HAdd.hAdd, ``HSub.hSub, ``HMul.hMul, ``HDiv.hDiv, ``HMod.hMod, ``HXor.hXor, ``HShiftLeft.hShiftLeft, ``HShiftRight.hShiftRight]

def getUnaryOperatorDeclarationInfos (namespaces : Array Name) : Array DeclarationInfo := Id.run do
  let mut result := #[]

  for namesp in namespaces do
    for (src, cls) in polymorphicTargetOperators do
      result := result.push (DeclarationInfo.ofUnary cls src namesp (some namesp))
    for (cls, tgt) in polymorphicSourceOperators do
      result := result.push (DeclarationInfo.ofUnary cls namesp namesp (some <| tgt.getD namesp))
    for cls in homogeneousUnaryOperators do
      result := result.push (DeclarationInfo.ofUnary cls namesp namesp (some namesp))

  return result
where
  polymorphicTargetOperators : Array (Name × Name) :=
    #[(``Nat, ``OfNat.ofNat), (``Nat, ``Nat.cast)]
  polymorphicSourceOperators : Array (Name × Option Name) :=
    #[(``LE.le, none), (``LT.lt, none)]
  homogeneousUnaryOperators : Array Name :=
    #[``Neg.neg, ``Complement.complement]


def getExplicitDeclarationInfos (namespaces : Array Name) : MetaM (Array DeclarationInfo) := do
  return getBinaryOperatorDeclarationInfos namespaces ++ getUnaryOperatorDeclarationInfos namespaces

def getDeclarationInfosForName (name : Name) (info : ConstantInfo) (namespaces : Array Name) (namespacesSet : NameSet) : MetaM (List DeclarationInfo) := do

  if ← name.isAutoDecl then
    return []

  let some matchedNamespace := namespaces.find? (·.isPrefixOf name) | return []

  let some declInfo := DeclarationInfo.within? matchedNamespace name info namespacesSet | return []

  return [declInfo]

end StdMetadata.Prototype
