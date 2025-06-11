/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Basic
import Grove.Framework.Widget.Facts

open Lean

namespace Grove.Framework.Backend

open Widget JTD

namespace Full

namespace Data

structure Assertion where
  id : String
  title : String
  success : Bool
  message : String

instance : SchemaFor Assertion :=
  .structure "assertion"
    [.single "id" Assertion.id,
     .single "title" Assertion.title,
     .single "success" Assertion.success,
     .single "message" Assertion.message]

structure Theorem where
  name : String
  renderedStatement : String
  isSimp : Bool
  isDeprecated : Bool

instance : SchemaFor Theorem :=
  .structure "theorem"
    [.single "name" Theorem.name,
     .single "renderedStatement" Theorem.renderedStatement,
     .single "isSimp" Theorem.isSimp,
     .single "isDeprecated" Theorem.isDeprecated]

structure Definition where
  name : String
  renderedStatement : String
  isDeprecated : Bool

instance : SchemaFor Definition :=
  .structure "definition"
    [.single "name" Definition.name,
     .single "renderedStatement" Definition.renderedStatement,
     .single "isDeprecated" Definition.isDeprecated]

inductive Declaration where
  | thm : Theorem → Declaration
  | def : Definition → Declaration
  | missing : String → Declaration

instance : SchemaFor Declaration :=
  .inductive "declaration"
    [.unary "thm" Theorem (fun | .thm t => some t | _ => none),
     .unary "def" Definition (fun | .def d => some d | _ => none),
     .unary "missing" String (fun | .missing s => some s | _ => none)]

structure ShowDeclaration.Fact where
  factId : String
  metadata : Fact.Metadata
  state : Declaration
  validationResult : Fact.ValidationResult

instance : SchemaFor ShowDeclaration.Fact :=
  .structure "showDeclarationFact"
    [.single "factId" ShowDeclaration.Fact.factId,
     .single "metadata" ShowDeclaration.Fact.metadata,
     .single "state" ShowDeclaration.Fact.state,
     .single "validationResult" ShowDeclaration.Fact.validationResult]

structure ShowDeclaration where
  id : String
  name : String
  declaration : Declaration
  facts : Array ShowDeclaration.Fact

instance : SchemaFor ShowDeclaration :=
  .structure "showDeclaration"
    [.single "id" ShowDeclaration.id,
     .single "name" ShowDeclaration.name,
     .single "declaration" ShowDeclaration.declaration,
     .arr "facts" ShowDeclaration.facts]

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
  SchemaFor.structure.toJson
    [.single toJson "id" Section.id,
     .single toJson "title" Section.title,
     .arr Node.toJson "children" Section.children] s

partial def Node.toJson (n : Node) : Json :=
  SchemaFor.inductive.toJson
    [.unary "section" Section (fun | .section s => some s | _ => none) Section.toJson,
     .unary "namespace" String (fun | .namespace s => some s | _ => none),
     .unary "assertion" Assertion (fun | .assertion a => some a | _ => none),
     .unary "showDeclaration" ShowDeclaration (fun | .showDeclaration s => some s | _ => none),
     .unary "text" String (fun | .text t => some t | _ => none)] n

end

instance : SchemaFor Section :=
  .structure "section"
    [.single "id" Section.id,
     .single "title" Section.title,
     .backArr "node" Node.toJson "children" Section.children]

instance : SchemaFor Node :=
  .inductive "node"
    [.unary "section" Section (fun | .section s => some s | _ => none),
     .unary "namespace" String (fun | .namespace s => some s | _ => none),
     .unary "assertion" Assertion (fun | .assertion a => some a | _ => none),
     .unary "showDeclaration" ShowDeclaration (fun | .showDeclaration s => some s | _ => none),
     .unary "text" String (fun | .text t => some t | _ => none)]

structure Project where
  projectNamespace : String
  rootNode : Node

instance : SchemaFor Project :=
  .structure "project"
    [.single "projectNamespace" Project.projectNamespace,
     .single "rootNode" Project.rootNode]

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
  let decl ← Declaration.fromName s.name
  let facts ← (factState.showDeclaration.getD s.id #[]).mapM (processFact decl)
  return {
    id := s.id
    name := s.name.toString
    declaration := processDeclaration decl
    facts
  }
where
  processFact (decl : Declaration) (f : ShowDeclaration.Fact) : MetaM Data.ShowDeclaration.Fact := do
    let validationResult ← f.validate decl
    return {
      factId := f.factId
      metadata := f.metadata
      state := processDeclaration f.state
      validationResult
    }

partial def processNode (factState : FactState) : Node → MetaM Data.Node
  | .section id title nodes => (.section ⟨id, title, ·⟩) <$> nodes.mapM (processNode factState)
  | .namespace n => pure <| .namespace n.toString
  | .assertion a => Data.Node.assertion <$> processAssertion a
  | .showDeclaration s => Data.Node.showDeclaration <$> processShowDeclaration factState s
  | .text s => pure <| .text s

def processProject (p : Project) : MetaM Data.Project :=
  Data.Project.mk p.projectNamespace.toString <$> processNode p.facts.run p.rootNode

def render (p : Project) : MetaM String :=
  (toString ∘ toJson) <$> processProject p

end Full

end Grove.Framework.Backend
