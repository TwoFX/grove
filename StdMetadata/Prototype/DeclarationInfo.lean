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

structure DeclarationInfo where
  fullName : Name
  key : String -- this is going to be the full name of the declaration
  displayName : Name
  searchKey : SearchKey
  fromNamespace : Name
  returnNamespace : Option Name

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

def DeclarationInfo.within (namesp name : Name) (info : ConstantInfo) (allNamespaces : NameSet) : DeclarationInfo := -- where
  let fromNamespace := computeOriginNamespace info namesp allNamespaces |>.getD namesp
  { fromNamespace
    fullName := name
    key := name.toString
    displayName := Name.dropPrefix? fromNamespace name |>.getD name
    searchKey := .byName name
    returnNamespace := computeReturnNamespace info allNamespaces }

def mkHomogeneousBinary (op type : Name) : Expr :=
  mkApp3 (mkConst op [.zero, .zero, .zero]) (mkConst type) (mkConst type) (mkConst type)

def DeclarationInfo.ofHomogeneousBinary (operation namesp : Name) : DeclarationInfo where
  fullName := operation
  key := operation.toString
  displayName := operation
  searchKey := .byExpr (mkHomogeneousBinary operation namesp)
  fromNamespace := namesp
  returnNamespace := namesp

def mkHomogeneousUnary (op type : Name) : Expr :=
  mkApp (mkConst op [.zero]) (mkConst type)

def DeclarationInfo.ofUnary (operation fromType toType : Name) : DeclarationInfo where
  fullName := operation
  key := operation.toString
  displayName := operation
  searchKey := .byExpr (mkHomogeneousUnary operation toType)
  fromNamespace := fromType
  returnNamespace := toType


-- def allowNames : NameSet :=
--   .ofList [``GetElem.getElem, ``GetElem?.getElem?, ``GetElem?.getElem!, ``Membership.mem]

-- def namespaceOverride : NameMap Name :=
--   .ofList [
--     (``Fin.mk, ``Nat),
--     (``Fin.ofNat', ``Nat),
--     (``BitVec.ofFin, ``Fin),
--     (``BitVec.ofNat, ``Nat),
--     (``BitVec.ofNatLT, ``Nat),
--     (``BitVec.ofInt, ``Int),
--     (``UInt8.ofBitVec, ``BitVec),
--     (``UInt8.ofFin, ``Fin),
--     (``UInt8.ofNat, ``Nat),
--     (``UInt8.ofNatLT, ``Nat),
--     (``UInt8.ofNatTruncate, ``Nat),
--     (``UInt16.ofBitVec, ``BitVec),
--     (``UInt16.ofFin, ``Fin),
--     (``UInt16.ofNat, ``Nat),
--     (``UInt16.ofNatLT, ``Nat),
--     (``UInt16.ofNatTruncate, ``Nat),
--     (``UInt32.ofBitVec, ``BitVec),
--     (``UInt32.ofFin, ``Fin),
--     (``UInt32.ofNat, ``Nat),
--     (``UInt32.ofNatLT, ``Nat),
--     (``UInt32.ofNatTruncate, ``Nat),
--     (``UInt64.ofBitVec, ``BitVec),
--     (``UInt64.ofFin, ``Fin),
--     (``UInt64.ofNat, ``Nat),
--     (``UInt64.ofNatLT, ``Nat),
--     (``UInt64.ofNatTruncate, ``Nat),
--     (``USize.ofBitVec, ``BitVec),
--     (``USize.ofFin, ``Fin),
--     (``USize.ofNat, ``Nat),
--     (``USize.ofNatLT, ``Nat),
--     (``USize.ofNatTruncate, ``Nat),
--     (``Int8.ofNat, ``Nat),
--     (``Int16.ofNat, ``Nat),
--     (``Int32.ofNat, ``Nat),
--     (``Int64.ofNat, ``Nat),
--     (``ISize.ofNat, ``Nat),
--     (``Int8.ofBitVec, ``BitVec),
--     (``Int8.ofInt, ``Int),
--     (``Int8.ofIntLE, ``Int),
--     (``Int8.ofIntTruncate, ``Int),
--     (``Int16.ofBitVec, ``BitVec),
--     (``Int16.ofInt, ``Int),
--     (``Int16.ofIntLE, ``Int),
--     (``Int16.ofIntTruncate, ``Int),
--     (``Int32.ofBitVec, ``BitVec),
--     (``Int32.ofInt, ``Int),
--     (``Int32.ofIntLE, ``Int),
--     (``Int32.ofIntTruncate, ``Int),
--     (``Int64.ofBitVec, ``BitVec),
--     (``Int64.ofInt, ``Int),
--     (``Int64.ofIntLE, ``Int),
--     (``Int64.ofIntTruncate, ``Int),
--     (``ISize.ofBitVec, ``BitVec),
--     (``ISize.ofInt, ``Int),
--     (``ISize.ofIntLE, ``Int),
--     (``ISize.ofIntTruncate, ``Int),
--     (``OfNat.ofNat, ``Nat),
--     (``Neg.neg, ``Int)
--   ]

def getBinaryOperatorDeclarationInfos (namespaces : Array Name) : Array DeclarationInfo := Id.run do
  let mut result := #[]

  for namesp in namespaces do
    for cls in binaryOperators do
      result := result.push (DeclarationInfo.ofHomogeneousBinary cls namesp)

  return result
where binaryOperators : Array Name :=
  #[``HAnd.hAnd, ``HOr.hOr, ``HAdd.hAdd, ``HSub.hSub, ``HMul.hMul, ``HDiv.hDiv]

def getUnaryOperatorDeclarationInfos (namespaces : Array Name) : Array DeclarationInfo := Id.run do
  let mut result := #[]

  for namesp in namespaces do
    result := result.push (DeclarationInfo.ofUnary ``OfNat.ofNat ``Nat namesp)
    for cls in homogeneousUnaryOperators do
      result := result.push (DeclarationInfo.ofUnary cls namesp namesp)

  return result
where homogeneousUnaryOperators : Array Name :=
  #[``Neg.neg]

def getExplicitDeclarationInfos (namespaces : Array Name) : MetaM (Array DeclarationInfo) := do
  return getBinaryOperatorDeclarationInfos namespaces ++ getUnaryOperatorDeclarationInfos namespaces

def getDeclarationInfosForName (name : Name) (info : ConstantInfo) (namespaces : Array Name) (namespacesSet : NameSet) : MetaM (List DeclarationInfo) := do

  if ← name.isAutoDecl then
    return []

  let some matchedNamespace := namespaces.find? (·.isPrefixOf name) | return []

  let declInfo := DeclarationInfo.within matchedNamespace name info namespacesSet

  if declInfo.displayName.getNumParts = 0 || (`Raw).isPrefixOf declInfo.displayName ||
      (`Internal).isPrefixOf declInfo.displayName then
    return []

  return [declInfo]

end StdMetadata.Prototype
