/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework
import TestProject.Grove.Structure.Basic
import TestProject.Grove.Generated

def config : Grove.Framework.Project.Configuration where
  projectNamespace := `TestProject.Grove

def project : Grove.Framework.Project where
  config := config
  rootNode := TestProject.Grove.Structure.root
  restoreState := TestProject.Grove.Generated.restoreState

def main (args : List String) : IO UInt32 :=
  Grove.Framework.main project #[`Init, `Std, `Lean] args
