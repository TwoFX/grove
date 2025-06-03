/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Framework.Basic
import StdMetadata.Framework.Widget.Facts

open Lean

def mkDisc (name : String) (child : α) (conv : α → Json := by exact toJson) : Json :=
  .mkObj [("constructor", name), (name, conv child)]

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
  name : String
  renderedStatement : String
  isSimp : Bool
  isDeprecated : Bool
deriving ToJson

structure Definition where
  name : String
  renderedStatement : String
  isDeprecated : Bool
deriving ToJson

inductive Declaration where
  | thm : Theorem → Declaration
  | def : Definition → Declaration
  | missing : String → Declaration

instance : ToJson Declaration where
  toJson
    | .thm t => mkDisc "thm" t
    | .def d => mkDisc "def" d
    | .missing s => mkDisc "missing" s

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

mutual

structure Section where
  id : String
  title : String
  children : Array Node

inductive Node where
  | «section» : Section → Node
  | «namespace» : String → Node
  | assertion : Assertion → Node
  | showDeclaration : ShowDeclaration → Node
  | text : String → Node

end

mutual

partial def Section.toJson (s : Section) : Json :=
  .mkObj [("id", s.id), ("title", s.title), ("children", .arr (s.children.map Node.toJson))]

partial def Node.toJson : Node → Json
  | .section s => mkDisc "section" s Section.toJson
  | .namespace n => mkDisc "namespace" n
  | .assertion a => mkDisc "assertion" a
  | .showDeclaration s => mkDisc "showDeclaration" s
  | .text s => mkDisc "text" s

end

instance : ToJson Section where
  toJson := Section.toJson

instance : ToJson Node where
  toJson := Node.toJson

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
  { t with name := t.name.toString }

def processDefinition (d : Definition) : Data.Definition :=
  { d with name := d.name.toString }

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
  | .section id title nodes => (.section ⟨id, title, ·⟩) <$> nodes.mapM (process factState)
  | .namespace n => pure <| .namespace n.toString
  -- | @Node.associationTable _ _ _ _ _ _ => pure <| .associationTable
  -- | @Node.table _ _ _ _ _ _ _ => pure <| .table
  | .assertion a => Data.Node.assertion <$> processAssertion a
  | .showDeclaration s => Data.Node.showDeclaration <$> processShowDeclaration factState s
  | .text s => pure <| .text s

def render (n : Node) (c : FactStateM Unit) : MetaM String :=
  (toString ∘ toJson) <$> process c.run n

end Full

end StdMetadata.Framework.Backend
