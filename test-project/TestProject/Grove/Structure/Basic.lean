/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework

open Lean Grove.Framework Widget

namespace TestProject.Grove.Structure

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

def listArrayOperations : AssociationTable .declaration [`TestProject.List, `TestProject.Array] where
  id := "list-array-operations"
  dataSources n := DataSource.declarationsInNamespace n

def root : Node :=
  .section "containers" "Containers" #[designNotes, noOptionToVector, optionMapALooksNice,
    .associationTable listArrayOperations]

end Containers

def introduction : Node :=
  .text "Welcome to the test project for Grove, a quality assurance system for Lean libraries."

def root : Node :=
  .section "test-project" "The Grove test project" #[introduction, Containers.root]

end TestProject.Grove.Structure
