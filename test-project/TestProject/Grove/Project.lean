/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
import Grove.Framework
import TestProject.Grove.Structure.Basic
import TestProject.Grove.Generated

namespace TestProject.Grove

def config : Grove.Framework.Project.Configuration where
  projectNamespace := `TestProject.Grove

def renamings : Array (String × String) := #[

]

def project : Grove.Framework.Project where
  config := config
  rootNode := TestProject.Grove.Structure.root
  renamings
  restoreState := TestProject.Grove.Generated.restoreState

def imports : Array Lean.Name := #[`Init, `Std, `Lean, `TestProject]

end TestProject.Grove
