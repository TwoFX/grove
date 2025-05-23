/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Framework.Widget.ShowDeclaration
import Std.Data.HashMap.Basic

open Std

open StdMetadata.Framework Widget

namespace StdMetadata.Framework

structure FactState where
  showDeclaration : HashMap String (Array ShowDeclaration.Fact) := ∅

abbrev FactStateM := StateM FactState

def FactStateM.run (c : FactStateM Unit) : FactState :=
  (StateT.run c {}).2

@[inline]
private def addToMap (m : HashMap String (Array α)) (id : String) (a : α) :=
  m.alter id (fun arr => some ((arr.getD #[]).push a))

def addShowDeclarationFact (f : ShowDeclaration.Fact) : FactStateM Unit :=
  modify (fun s => { s with showDeclaration := addToMap s.showDeclaration f.widgetId f })

end StdMetadata.Framework
