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
  widgetId : String
  factId : String
  metadata : Fact.Metadata
  state : Declaration
  validationResult : Fact.ValidationResult

instance : SchemaFor ShowDeclaration.Fact :=
  .structure "showDeclarationFact"
    [.single "widgetId" ShowDeclaration.Fact.widgetId,
     .single "factId" ShowDeclaration.Fact.factId,
     .single "metadata" ShowDeclaration.Fact.metadata,
     .single "state" ShowDeclaration.Fact.state,
     .single "validationResult" ShowDeclaration.Fact.validationResult]

structure ShowDeclaration.Definition where
  id : String
  name : String
  declarationKey : String

instance : SchemaFor ShowDeclaration.Definition :=
  .structure "showDeclarationDefinition"
    [.single "id" ShowDeclaration.Definition.id,
     .single "name" ShowDeclaration.Definition.name,
     .single "declarationKey" ShowDeclaration.Definition.declarationKey]

structure ShowDeclaration where
  definition : ShowDeclaration.Definition
  facts : Array ShowDeclaration.Fact

instance : SchemaFor ShowDeclaration :=
  .structure "showDeclaration"
    [.single "definition" ShowDeclaration.definition,
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
  hash : String
  rootNode : Node
  declarations : Array Data.Declaration

instance : SchemaFor Project :=
  .structure "project"
    [.single "projectNamespace" Project.projectNamespace,
     .single "hash" Project.hash,
     .single "rootNode" Project.rootNode,
     .arr "declarations" Project.declarations]

structure InvalidatedFact where
  widgetId : String
  factId : String

instance : SchemaFor InvalidatedFact :=
  .structure "invalidatedFact"
    [.single "widgetId" InvalidatedFact.widgetId,
     .single "factId" InvalidatedFact.factId]

structure InvalidatedFacts where
  invalidatedFacts : Array InvalidatedFact

instance : SchemaFor InvalidatedFacts :=
  .structure "invalidatedFacts"
    [.arr "invalidatedFacts" InvalidatedFacts.invalidatedFacts]

end Data

section RenderM

structure RenderState where
  declarations : Std.HashMap String Declaration := ∅

def RenderState.getDeclaration (r : RenderState) (n : Name) : MetaM (RenderState × Declaration) :=
  match r.declarations.get? n.toString with
  | none => do
    let d ← Declaration.fromName n
    return ({ r with declarations := r.declarations.insert n.toString d }, d)
  | some d => return (r, d)

abbrev RenderM := StateRefT RenderState MetaM

def RenderM.modifyGetM {α β : Type} (f : RenderState → α → MetaM (RenderState × β)) (a : α) : RenderM β := do
  let oldState ← get
  set ({ } : RenderState)
  let (newState, result) ← f oldState a
  set newState
  return result

def getDeclaration (n : Name) : RenderM Declaration :=
  RenderM.modifyGetM RenderState.getDeclaration n

def RenderM.run {α : Type} (r : RenderM α) : MetaM (α × RenderState) :=
  StateRefT'.run r {}

end RenderM

def processAssertion (a : Assertion) : RenderM Data.Assertion := do
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

def processShowDeclaration (state : SavedState) (s : ShowDeclaration) : RenderM Data.ShowDeclaration := do
  let decl ← getDeclaration s.name
  let facts ← (state.showDeclaration.getD s.id #[]).mapM (processFact s.id decl)
  return {
    definition := {
      id := s.id
      name := s.name.toString
      declarationKey := s.name.toString
    }
    facts
  }
where
  processFact (widgetId : String) (decl : Declaration) (f : ShowDeclaration.Fact) : RenderM Data.ShowDeclaration.Fact := do
    let validationResult ← f.validate decl
    return {
      widgetId := widgetId
      factId := f.factId
      metadata := f.metadata
      state := processDeclaration f.state
      validationResult
    }

partial def processNode (state : SavedState) : Node → RenderM Data.Node
  | .section id title nodes => (.section ⟨id, title, ·⟩) <$> nodes.mapM (processNode state)
  | .namespace n => pure <| .namespace n.toString
  | .assertion a => Data.Node.assertion <$> processAssertion a
  | .showDeclaration s => Data.Node.showDeclaration <$> processShowDeclaration state s
  | .text s => pure <| .text s

def processProject (p : Project) : MetaM Data.Project := do
  let (rootNode, renderState) ← (processNode p.restoreState.run p.rootNode).run

  return {
    projectNamespace := p.config.projectNamespace.toString
    hash := ← p.config.getHash
    rootNode := rootNode
    declarations := renderState.declarations.valuesArray.map processDeclaration
  }

structure RenderResult where
  fullOutput : String
  invalidatedFacts : String

partial def Data.Project.collectInvalidatedFacts (p : Data.Project) : InvalidatedFacts :=
  ⟨((explore p.rootNode).run #[]).2⟩
where
  explore (n : Data.Node) : StateM (Array InvalidatedFact) PUnit := do
    match n with
    | .section s => s.children.forM explore
    | .namespace _ => return ()
    | .assertion _ => return ()
    | .showDeclaration s => s.facts.forM (exploreShowDeclarationFact s.definition.id)
    | .text _ => return ()
  exploreShowDeclarationFact (widgetId : String) (s : Data.ShowDeclaration.Fact) : StateM (Array InvalidatedFact) PUnit := do
    if s.validationResult matches .invalidated _ then
      modify (·.push ⟨widgetId, s.factId⟩)

def Data.Project.render (p : Data.Project) : RenderResult where
  fullOutput := toString (toJson p)
  invalidatedFacts := toString (toJson p.collectInvalidatedFacts)

def render (p : Project) : MetaM RenderResult :=
  (·.render) <$> processProject p

end Full

end Grove.Framework.Backend
