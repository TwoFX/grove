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

def thisJustFails : Assertion where
  widgetId := "this-just-fails"
  title := "A failing assertion"
  description := "This assertion fails"
  unassertedFactMode := .needsAttention
  check := pure #[{
    assertionId := "0"
    description := "Failing assertion"
    passed := false
    message := "Failed!"
  }]

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

def introduction : Text where
  id := "string-introduction"
  content := Grove.Markdown.render [
    .h1 "The Lean string library",
    .text "The Lean standard library contains a fully-featured string library, centered around the types `String` and `String.Slice`.",
    .text "`String` is defined as the subtype of `ByteArray` of valid UTF-8 strings. A `String.Slice` is a `String` together with a start and end position.",
    .text "`String` is equivalent to `List Char`, but it has a more efficient runtime representation. While the logical model based on `ByteArray` is overwritten in the runtime, the runtime implementation is very similar to the logical model, with the main difference being that the length of a string in Unicode code points is cached in the runtime implementation.",
    .text "We are considering removing this feature in the future (i.e., deprecating `String.length`), as the number of UTF-8 codepoints in a string is not particularly useful, and if needed it can be computed in linear time using `s.positions.count`."
  ]

def creatingStringsAndSlices : Text where
  id := "transforming-strings-and-slices"
  content := Grove.Markdown.render [
    .h2 "Transforming strings and slices",
    .text "The Lean standard library contains a number of functions that take one or more strings and slices and return a string or a slice.",
    .text "If possible, these functions should avoid allocating a new string, and return a slice of their input(s) instead.",
    .text "Usually, for every operation `f`, there will be functions `String.f` and `String.Slice.f`, where `String.f s` is defined as `String.Slice.f s.toSlice`.",
    .text "In particular, functions that transform strings and slices should live in the `String` and `String.Slice` namespaces even if they involve a `String.Pos`/`String.Slice.Pos` (like `String.sliceTo`), for reasons that will become clear shortly.",

    .h3 "Transforming positions",
    .text "Since positions on strings and slices are dependent on the string or slice, whenever users transform a string/slice, they will be interested in interpreting positions on the original string/slice as positions on the result, or vice versa.",
    .text "Consequently, every operation that transforms a string or slice should come with a corresponding set of transformations between positions, usually in both directions, possibly with one of the directions being conditional.",
    .text "For example, given a string `s` and a position `p` on `s`, we have the slice `s.sliceFrom p`, which is the slice from `p` to the end of `s`. A position on `s.sliceFrom p` can always be interpreted as a position on `s`. This is the \"backwards\" transformation. Conversely, a position `q` on `s` can be interpreted as a position on `s.sliceFrom p` as long as `p ≤ q`. This is the conditional forwards direction.",
    .text "The convention for naming these transformations is that the forwards transformation should have the same name as the transformation on strings/slices, but it should be located in the `String.Pos` or `String.Slice.Pos` namespace, depending on the type of the starting position (so that dot notation is possible for the forward direction). The backwards transformation should have the same name as the operation on strings/slices, but with an `of` prefix, and live in the same namespace as the forwards transformation (so in general dot notation will not be available).",
    .text "So, in the `sliceFrom` example, the forward direction would be called `String.Pos.sliceFrom`, while the backwards direction should be called `String.Pos.ofSliceFrom` (not `String.Slice.Pos.ofSliceFrom`).",
    .text "If one of the directions is conditional, it should have a corresponding panicking operation that does not require a proof; in our example this would be `String.Pos.sliceFrom!`.",
    .text "Sometimes there is a name clash for the panicking operations if the operation on strings is already panicking. For example, there are both `String.slice` and `String.slice!`. If the original operation is already panicking, we only provide panicking transformation operations. But now `String.Pos.slice!` could refer both to the panicking forwards transformation associated with `String.slice`, and also to the (only) forwards transformation associated with `String.slice!`. In this situation, we use an `orPanic` suffix to disambiguate. So the panicking forwards operation associated with `String.slice` is called `String.Pos.sliceOrPanic`, and the forwards operation associated with `String.slice!` is called `String.Pos.slice!`."
  ]

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

def sliceProducingComplete : Assertion where
  widgetId := "slice-producing-complete"
  title := "Slice-producing table is complete"
  description := "All functions in the `String.**` namespace that return a string or a slice are covered in the table"
  unassertedFactMode := .needsAttention
  check := do
    let mut ans := #[]
    let covered := Std.HashSet.ofArray (← valuesInAssociationTable sliceProducing)
    let pred : DataSource.DeclarationPredicate :=
      DataSource.DeclarationPredicate.all [.isDefinition, .not .isDeprecated,
        .notInNamespace `String.Pos.Raw, .notInNamespace `String.Legacy,
        .not .isInstance]
    let env ← getEnv
    for name in ← declarationsMatching `String pred do
      let some c := env.find? name | continue
      if c.type.getForallBody.getUsedConstants.any (fun n => n == ``String || n == ``String.Slice) then
        let success : Bool := name.toString ∈ covered
        ans := ans.push {
          assertionId := name.toString
          description := s!"`{name}` should appear in the table."
          passed := success
          message := s!"`{name}` was{if success then "" else " not"} found in the table."
        }
    return ans

def root : Node :=
  .section "Strings" "String examples" #[.text introduction, .text creatingStringsAndSlices, .associationTable sliceProducing, .assertion sliceProducingComplete]

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

def introduction2 : Text where
  id := "introduction2"
  content := Grove.Markdown.render [
    .h1 "Grove Markdown support",
    .text "In fact, Grove contains an extremely basic Markdown library that can be used to write Markdown in Lean without giant string literals.",
    .text "It's really little more than a function that takes a list of strings and concatenates them.",
    .h2 "Here is a level-two heading",
    .text "With some text",
    .h3 "And here is a level-three heading",
    .text "With some more text"
  ]


def root : Node :=
  .section "test-project" "The Grove test project" #[introduction, .text introduction2, Containers.root, SizeIssue.root,
    Conversion.root, Strings.root]

end TestProject.Grove.Structure
