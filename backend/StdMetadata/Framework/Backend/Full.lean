/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Framework.Basic
import StdMetadata.Framework.Widget.Facts

open Lean

namespace StdMetadata.Framework.Backend

open Widget

namespace Full

namespace Data

structure Assertion where
  id : String
  title : String
  success : Bool
  message : String
deriving Lean.ToJson

structure Theorem where
  name : Name
  renderedStatement : String
  isSimp : Bool
  isDeprecated : Bool
deriving ToJson

structure Definition where
  name : Name
  renderedStatement : String
  isDeprecated : Bool
deriving ToJson

inductive Declaration where
  | thm : Theorem → Declaration
  | def : Definition → Declaration
  | missing : String → Declaration
deriving ToJson

structure ShowDeclaration.Fact where
  factId : String
  metadata : Fact.Metadata
  state : Declaration
  validationResult : Fact.ValidationResult
deriving ToJson

structure ShowDeclaration where
  id : String
  name : String
  facts : Array ShowDeclaration.Fact
deriving Lean.ToJson

inductive Node where
  | «section» : String → String → Array Node → Node
  | «namespace» : String → Node
  | associationTable : Node
  | table : Node
  | assertion : Assertion → Node
  | showDeclaration : ShowDeclaration → Node
  | text : String → Node
deriving Lean.ToJson

end Data

def processAssertion (a : Assertion) : MetaM Data.Assertion := do
  let result ← a.check
  return {
    id := a.id
    title := a.title
    success := result.passed
    message := result.message
  }

def processTheorem (t : Theorem) : Data.Theorem :=
  { t with }

def processDefinition (d : Definition) : Data.Definition :=
  { d with }

def processDeclaration : Declaration → Data.Declaration
  | .thm t => .thm (processTheorem t)
  | .def d => .def (processDefinition d)
  | .missing n => .missing n.toString

def processShowDeclaration (factState : FactState) (s : ShowDeclaration) : MetaM Data.ShowDeclaration := do
  let facts ← (factState.showDeclaration.getD s.id #[]).mapM (processFact s)
  return {
    id := s.id
    name := s.name.toString
    facts
  }
where
  processFact (s : ShowDeclaration) (f : ShowDeclaration.Fact) : MetaM Data.ShowDeclaration.Fact := do
    let validationResult ← f.validate s
    return {
      factId := f.factId
      metadata := f.metadata
      state := processDeclaration f.state
      validationResult
    }

partial def process (factState : FactState) : Node → MetaM Data.Node
  | .section id title nodes => .section id title <$> nodes.mapM (process factState)
  | .namespace n => pure <| .namespace n.toString
  | @Node.associationTable _ _ _ _ _ _ => pure <| .associationTable
  | @Node.table _ _ _ _ _ _ _ => pure <| .table
  | .assertion a => Data.Node.assertion <$> processAssertion a
  | .showDeclaration s => Data.Node.showDeclaration <$> processShowDeclaration factState s
  | .text s => pure <| .text s

def render (n : Node) (c : FactStateM Unit) : MetaM String :=
  (toString ∘ toJson) <$> process c.run n

end Full

end StdMetadata.Framework.Backend
