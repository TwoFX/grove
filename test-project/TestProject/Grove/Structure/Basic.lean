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
  .text "Here I can put design notes about the *containers library*."

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

def listArrayOperations : AssociationTable .subexpression [`List, `Array] where
  id := "list-array-operations"
  title := "List and array operations"
  description := "This table associates list operations with array operations"
  dataSources n :=
    (DataSource.declarationsInNamespace n .definitionsOnly)
    |>.or (DataSource.declarationsInNamespace (`TestProject ++ n) .definitionsOnly)
    |>.map Subexpression.declaration
    |>.or (DataSource.getElem n)

def listArrayLemmas : Table .subexpression .subexpression .declaration [`List, `Array] where
  id := "list-array-lemmas"
  title := "List and array lemmas"
  description := "This table checks that lemmas are there relating list and array operations among each other"
  rowsFrom := .table listArrayOperations
  columnsFrom := .table listArrayOperations
  cellData := .classic _ {
    relevantNamespaces := [`List, `Array, `TestProject.List]
  }

def root : Node :=
  .section "containers" "Containers" #[designNotes, noOptionToVector, optionMapALooksNice,
    .associationTable listArrayOperations, .table listArrayLemmas]

end Containers

def introduction : Node :=
  .text "Welcome to the test project for Grove, a quality assurance system for Lean libraries.\n\
  \n\
  These text elements are `Markdown`, so in particular they can be multiple lines."

def root : Node :=
  .section "test-project" "The Grove test project" #[introduction, Containers.root]

end TestProject.Grove.Structure
