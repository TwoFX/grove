/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework
import TestProject.Grove.Structure.Basic
import TestProject.Grove.Facts.Basic

def main : IO Unit :=
  Grove.Framework.main
    TestProject.Grove.Structure.root
    TestProject.Grove.Facts.addFacts
    #[`Init, `Std, `Lean]
