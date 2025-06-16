/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Widget.ShowDeclaration
import Std.Data.HashMap.Basic

open Std

open Grove.Framework Widget

namespace Grove.Framework

structure SavedState where
  showDeclaration : HashMap String (Array ShowDeclaration.Fact) := ∅

abbrev RestoreStateM := StateM SavedState

def RestoreStateM.run (c : RestoreStateM Unit) : SavedState :=
  (StateT.run c {}).2

@[inline]
private def addToMap (m : HashMap String (Array α)) (id : String) (a : α) : HashMap String (Array α) :=
  m.alter id (fun arr => some ((arr.getD #[]).push a))

def addShowDeclarationFact (f : ShowDeclaration.Fact) : RestoreStateM Unit :=
  modify (fun s => { s with showDeclaration := addToMap s.showDeclaration f.widgetId f })

end Grove.Framework
