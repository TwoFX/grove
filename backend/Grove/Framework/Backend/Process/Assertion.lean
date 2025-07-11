/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Backend.Data
import Grove.Framework.Backend.RenderM.Basic

namespace Grove.Framework.Backend.Full

open Widget JTD Std

namespace Data

structure Assertion.Result where
  assertionId : String
  description : String
  passed : Bool
  message : String

instance : SchemaFor Assertion.Result :=
  .structure "AssertionResult"
    [.single "assertionId" Assertion.Result.assertionId,
     .single "description" Assertion.Result.description,
     .single "passed" Assertion.Result.passed,
     .single "message" Assertion.Result.message]

structure Assertion.Definition where
  widgetId : String
  title : String
  description : String
  results : Array Assertion.Result

instance schemaAssertionDefinition : SchemaFor Assertion.Definition :=
  .structure "AssertionDefinition"
    [.single "widgetId" Assertion.Definition.widgetId,
     .single "title" Assertion.Definition.title,
     .single "description" Assertion.Definition.description,
     .arr "results" Assertion.Definition.results]

structure Assertion.Fact where
  widgetId : String
  factId : String
  assertionId : String
  state : Assertion.Result
  metadata : Fact.Metadata
  validationResult : Fact.ValidationResult

instance validatedFactAssertionFact : ValidatedFact Assertion.Fact where
  widgetId := Assertion.Fact.widgetId
  factId := Assertion.Fact.factId
  validationResult := Assertion.Fact.validationResult

instance schemaAssertionFact : SchemaFor Assertion.Fact :=
  .structure "AssertionFact"
    [.single "widgetId" Assertion.Fact.widgetId,
     .single "factId" Assertion.Fact.factId,
     .single "assertionId" Assertion.Fact.assertionId,
     .single "state" Assertion.Fact.state,
     .single "metadata" Assertion.Fact.metadata,
     .single "validationResult" Assertion.Fact.validationResult]

structure Assertion where
  definition : Assertion.Definition
  facts : Array Assertion.Fact

instance : SchemaFor Assertion :=
  .structure "Assertion"
    [.single "definition" Assertion.definition,
     .arr "facts" Assertion.facts]

end Data

namespace Assertion

def processSingle (res : Assertion.Result) : Data.Assertion.Result := { res with }

def processFacts (results : Array Assertion.Result) (facts : Array Assertion.Fact) :
    Array Data.Assertion.Fact :=
  let resultsById : Std.HashMap String Assertion.Result := results.foldl (init := ∅)
    (fun sofar result => sofar.insert result.assertionId result)
  facts.filterMap (fun fact => resultsById[fact.assertionId]?.map (fun currentState => {
    widgetId := fact.widgetId
    factId := fact.factId
    assertionId := fact.assertionId
    state := processSingle fact.state
    metadata := fact.metadata
    validationResult :=
      match describeDifferences fact.state currentState with
      | none => .ok
      | some s => .invalidated ⟨s.1, s.2⟩
  }))
where
  describeDifferences (old new : Assertion.Result) : Option (String × String) :=
    let differences' : List (Option (Option String × List Markdown.Paragraph)) :=
      [comparePassed old.passed new.passed,
       compareMessages old.message new.message]
    let differences := differences'.filterMap id
    if differences.isEmpty then none else some
      (differences.foldl (init := none) (fun sofar q => sofar.or q.1) |>.getD "Results differ",
       differences.flatMap (·.2) |> Markdown.render)
  comparePassed (old new : Bool) : Option (Option String × List Markdown.Paragraph) :=
    match old, new with
    | false, true => some ("Newly passed", ["Used to fail, now passes"])
    | true, false => some ("Newly failed", ["Used to pass, now fails"])
    | _, _ => none
  compareMessages (old new : String) : Option (Option String × List Markdown.Paragraph) :=
    if old == new then none else
      some ("Message changed", ["Message used to be", .blockQuote old, "now is", .blockQuote new])

end Assertion

def processAssertion (a : Assertion) : RenderM Data.Assertion := do
  let results ← a.check

  let savedFacts := (← findAssertion? a.widgetId).map Assertion.Data.facts |>.getD #[]

  return {
    definition := {
      widgetId := a.widgetId
      title := a.title
      description := a.description
      results := results.map Assertion.processSingle
    }
    facts := Assertion.processFacts results savedFacts
  }

end Grove.Framework.Backend.Full
