/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Declaration
import Grove.Framework.Search

open Lean

namespace Grove.Framework

structure Subexpression where
  searchKey : SearchKey
  displayName : String

def Subexpression.matches (s : Subexpression) (e : Expr) (usedConstants : NameSet) : Bool :=
  s.searchKey.matches e usedConstants

instance : HasId Subexpression where
  getId s := s.searchKey.id

def Declaration.toSubexpression (d : Declaration) : Subexpression where
  searchKey := .byName d.name
  displayName := d.name.toString

end Grove.Framework
