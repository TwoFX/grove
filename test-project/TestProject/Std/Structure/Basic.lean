/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Framework

/-!
This will be split into multiple files in the future.

For now this is just for testing.
-/

open Lean StdMetadata.Framework Widget

namespace TestProject.Std

namespace Containers

def designNotes : Node :=
  .text "Here I can put design notes about the containers library."

def noOptionToVector : Assertion where
  id := "no-option-to-vector"
  title := "There is no declaration called 'Option.toVector'"
  check := do
    if (← getEnv).contains `Option.toVector then
      return .failure "Oh no, there is something called 'Option.toVector'!"
    else
      return .success "As expected, 'Option.toVector' does not exist."

def optionMapALooksNice : ShowDeclaration where
  id := "show-option-mapa"
  name := `Option.mapA

def root : Node :=
  .section "containers" "Containers" #[designNotes, noOptionToVector, optionMapALooksNice]

end Containers

def standardLibrary : Node :=
  .section "stdlib" "The Lean standard library" #[Containers.root]

end TestProject.Std
