/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Prototype.Name
import Lean

open Lean

namespace StdMetadata.Prototype

structure DeclarationInfo where
  key : String -- this is going to be the full name of the declaration
  displayName : Name
  returnNamespace : Option Name

def computeReturnNamespace (info : ConstantInfo) (allNamespaces : NameSet) : Option Name :=
  info.type.getForallBody.getUsedConstants.find? allNamespaces.contains

def DeclarationInfo.within (namesp name : Name) (info : ConstantInfo) (allNamespaces : NameSet) : DeclarationInfo where
  key := name.toString
  displayName := Name.dropPrefix namesp.getNumParts name
  returnNamespace := computeReturnNamespace info allNamespaces

def DeclarationInfo.of (name : Name) (info : ConstantInfo) (allNamespaces : NameSet) : DeclarationInfo where
  key := name.toString
  displayName := name
  returnNamespace := computeReturnNamespace info allNamespaces

def allowNames : NameSet :=
  .ofList [``GetElem.getElem, ``GetElem?.getElem?, ``GetElem?.getElem!, ``Membership.mem]

def namespaceOverride : NameMap Name :=
  .ofList [
    (``Fin.mk, ``Nat),
    (``Fin.ofNat', ``Nat),
    (``BitVec.ofFin, ``Fin),
    (``BitVec.ofNatLT, ``Nat),
    (``BitVec.ofInt, ``Int),
    (``UInt8.ofBitVec, ``BitVec),
    (``UInt8.ofFin, ``Fin),
    (``UInt8.ofNat, ``Nat),
    (``UInt8.ofNatLT, ``Nat),
    (``UInt8.ofNatTruncate, ``Nat),
    (``UInt16.ofBitVec, ``BitVec),
    (``UInt16.ofFin, ``Fin),
    (``UInt16.ofNat, ``Nat),
    (``UInt16.ofNatLT, ``Nat),
    (``UInt16.ofNatTruncate, ``Nat),
    (``UInt32.ofBitVec, ``BitVec),
    (``UInt32.ofFin, ``Fin),
    (``UInt32.ofNat, ``Nat),
    (``UInt32.ofNatLT, ``Nat),
    (``UInt32.ofNatTruncate, ``Nat),
    (``UInt64.ofBitVec, ``BitVec),
    (``UInt64.ofFin, ``Fin),
    (``UInt64.ofNat, ``Nat),
    (``UInt64.ofNatLT, ``Nat),
    (``UInt64.ofNatTruncate, ``Nat),
    (``USize.ofBitVec, ``BitVec),
    (``USize.ofFin, ``Fin),
    (``USize.ofNat, ``Nat),
    (``USize.ofNatLT, ``Nat),
    (``USize.ofNatTruncate, ``Nat),
    (``Int8.ofNat, ``Nat),
    (``Int16.ofNat, ``Nat),
    (``Int32.ofNat, ``Nat),
    (``Int64.ofNat, ``Nat),
    (``ISize.ofNat, ``Nat),
    (``Int8.ofBitVec, ``BitVec),
    (``Int8.ofInt, ``Int),
    (``Int8.ofIntLE, ``Int),
    (``Int8.ofIntTruncate, ``Int),
    (``Int16.ofBitVec, ``BitVec),
    (``Int16.ofInt, ``Int),
    (``Int16.ofIntLE, ``Int),
    (``Int16.ofIntTruncate, ``Int),
    (``Int32.ofBitVec, ``BitVec),
    (``Int32.ofInt, ``Int),
    (``Int32.ofIntLE, ``Int),
    (``Int32.ofIntTruncate, ``Int),
    (``Int64.ofBitVec, ``BitVec),
    (``Int64.ofInt, ``Int),
    (``Int64.ofIntLE, ``Int),
    (``Int64.ofIntTruncate, ``Int),
    (``ISize.ofBitVec, ``BitVec),
    (``ISize.ofInt, ``Int),
    (``ISize.ofIntLE, ``Int),
    (``ISize.ofIntTruncate, ``Int),
  ]

def badNameIn (namesp name : Name) : MetaM Bool := do
  return !namesp.isPrefixOf name || (← name.isAutoDecl)

def getDeclarationInfo? (namesp name : Name) (info : ConstantInfo) (allNamespaces : NameSet) : MetaM (Option DeclarationInfo) := do
  if allowNames.contains name then
    return some (DeclarationInfo.of name info allNamespaces)
  if let some target := namespaceOverride.find? name then do
    if target == namesp then do
      return some (DeclarationInfo.of name info allNamespaces)

  if ← badNameIn namesp name then
    return none

  let declInfo := DeclarationInfo.within namesp name info allNamespaces

  if declInfo.displayName.getNumParts = 0 || (`Raw).isPrefixOf declInfo.displayName ||
      (`Internal).isPrefixOf declInfo.displayName then
    return none

  return some declInfo

end StdMetadata.Prototype
