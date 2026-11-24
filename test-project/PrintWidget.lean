/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
import TestProject.Grove.Project
import TestProject

def main (args : List String) : IO UInt32 :=
  Grove.Framework.printWidgetMain TestProject.Grove.project TestProject.Grove.imports args
