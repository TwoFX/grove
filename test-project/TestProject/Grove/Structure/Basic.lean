/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework

open Lean Grove.Framework Widget DataSource

namespace TestProject.Grove.Structure

namespace Containers

def designNotes : Node :=
  .text ⟨"container-design-notes", "Here I can put design notes about the *containers library*."⟩

def noOptionToVector : Assertion where
  widgetId := "no-option-to-vector"
  title := "No Option.toVector"
  description := "There is no declaration called 'Option.toVector'"
  check := do
    if (← getEnv).contains `Option.toVector then
      return #[.failure "0" "n/A" "Oh no, there is something called 'Option.toVector'!"]
    else
      return #[.success "0" "n/A" "As expected, 'Option.toVector' does not exist."]

def optionMapALooksNice : ShowDeclaration where
  id := "show-option-mapa"
  name := `Option.mapA

def listArrayOperations : AssociationTable .subexpression [`List, `Array] where
  id := "list-array-operations"
  title := "List and array operations"
  description := "This table associates list operations with array operations"
  dataSources n :=
    (DataSource.definitionsInNamespace n)
    |>.or (DataSource.definitionsInNamespace (`TestProject ++ n))
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

namespace SizeIssue

def associativeContainers : List Lean.Name :=
  [`Std.DHashMap, `Std.DHashMap.Raw, `Std.ExtDHashMap, `Std.DTreeMap, `Std.DTreeMap.Raw, `Std.ExtDTreeMap, `Std.HashMap,
   `Std.HashMap.Raw, `Std.ExtHashMap, `Std.TreeMap, `Std.TreeMap.Raw, `Std.ExtTreeMap, `Std.HashSet, `Std.HashSet.Raw, `Std.ExtHashSet,
   `Std.TreeSet, `Std.TreeSet.Raw, `Std.ExtTreeSet]

def exceptions (namesp : Lean.Name) : DeclarationPredicate :=
  .disallow [`Std.DHashMap.Raw.buckets, namesp]

def associativeExceptions (namesp : Lean.Name) : DeclarationPredicate :=
  DeclarationPredicate.all
    [.notInNamespace (namesp ++ `Const),
     .notInNamespace (namesp ++ `Raw),
     exceptions namesp]

def associativeQueryOperations : AssociationTable .subexpression associativeContainers where
  id := "associative-query-operations"
  title := "Associative query operations"
  description := "Operations that take as input an associative container and return a 'single' piece of information (e.g., `GetElem` or `isEmpty`, but not `toList`)."
  dataSources n :=
    (DataSource.definitionsInNamespace n (associativeExceptions n))
      |>.map Subexpression.declaration
      |>.or (DataSource.getElem n)

def associativeCreationOperations : AssociationTable .subexpression associativeContainers where
  id := "associative-creation-operations"
  title := "Associative creation operations"
  description := "Operations that create a new associative container"
  dataSources n :=
    (DataSource.definitionsInNamespace n (associativeExceptions n))
      |>.map Subexpression.declaration
      |>.or (DataSource.emptyCollection n)

def associativeModificationOperations : AssociationTable .subexpression associativeContainers where
  id := "associative-modification-operations"
  title := "Associative modification operations"
  description := "Operations that both accept and return an associative container"
  dataSources n :=
    (DataSource.definitionsInNamespace n (associativeExceptions n))
      |>.map Subexpression.declaration

def associativeCreateThenQuery : Table .subexpression .subexpression .declaration associativeContainers where
  id := "associative-create-then-query"
  title := "Associative create then query"
  description := "Lemmas that say what happens when creating a new associative container and then immediately querying from it"
  rowsFrom := .table associativeCreationOperations
  columnsFrom := .table associativeQueryOperations
  cellData := .classic _ { relevantNamespaces := associativeContainers }

def root : Node :=
  .section "size-issue" "Size Issue" #[.associationTable associativeQueryOperations,
    .associationTable associativeCreationOperations, .associationTable associativeModificationOperations,
    .table associativeCreateThenQuery]

end SizeIssue

namespace Strings

def sliceProducing : AssociationTable (β := Alias Lean.Name) .declaration
    [`String, `String.Slice,
     Alias.mk `String.Pos "string-pos-forwards" "String.Pos (forwards)",
     Alias.mk `String.Pos "string-pos-backwards" "String.Pos (backwards)",
     Alias.mk `String.Pos "string-pos-noproof" "String.Pos (no proof)",
     Alias.mk `String.Slice.Pos "string-slice-pos-forwards" "String.Slice.Pos (forwards)",
     Alias.mk `String.Slice.Pos "string-slice-pos-backwards" "String.Slice.Pos (backwards)",
     Alias.mk `String.Slice.Pos "string-slice-pos-noproof" "String.Slice.Pos (no proof)"] where
  id := "slice-producing"
  title := "String functions returning slices"
  description := "Operations on strings and string slices that themselves return a new string slice."
  dataSources n := DataSource.definitionsInNamespace n.inner

def root : Node :=
  .section "Strings" "String examples" #[.associationTable sliceProducing]

end Strings

namespace Conversion

def someFiniteIntegerTypes : List Lean.Name :=
  [`UInt8, `UInt16, `UInt32, `UInt64, `USize]

def finiteIntegerArithmetic : AssociationTable .subexpression someFiniteIntegerTypes where
  id := "finite-integer-arithmetic"
  title := "Finite Integer Arithmetic"
  dataSources n :=
    (DataSource.definitionsInNamespace n)
      |>.map Subexpression.declaration
      |>.or (DataSource.binaryArithmetic n)

def finiteIntegerConversions : AssociationTable .subexpression someFiniteIntegerTypes where
  id := "finite-integer-conversions"
  title := "Finite Integer Conversions"
  dataSources n := (DataSource.definitionsInNamespace n) |>.map Subexpression.declaration

def finiteIntegerConvertThenConvert : Table .subexpression .subexpression .declaration someFiniteIntegerTypes where
  id := "finite-integer-convert-then-convert"
  title := "Finite Integer Convert then Convert"
  rowsFrom := .table finiteIntegerConversions
  columnsFrom := .table finiteIntegerConversions
  cellData := .classic _

def root : Node :=
  .section "conversion" "Conversion" #[.associationTable finiteIntegerArithmetic,
    .associationTable finiteIntegerConversions, .table finiteIntegerConvertThenConvert]

end Conversion

def introduction : Node :=
  .text ⟨"introduction", "Welcome to the test project for Grove, a quality assurance system for Lean libraries.\n\
  \n\
  These text elements are `Markdown`, so in particular they can be multiple lines."⟩

def root : Node :=
  .section "test-project" "The Grove test project" #[introduction, Containers.root, SizeIssue.root,
    Conversion.root, Strings.root]

end TestProject.Grove.Structure
