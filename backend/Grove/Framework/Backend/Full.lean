/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.Basic
public import Grove.Framework.Backend.Data
public import Grove.Framework.Backend.Process

open Lean

namespace Grove.Framework.Backend

open Widget JTD

namespace Full

namespace Data

public section

mutual

public structure Section where
  id : String
  title : String
  children : Array Node

public inductive Node where
  | «section» : Section → Node
  | associationTable : AssociationTable → Node
  | table : Table → Node
  | «namespace» : String → Node
  | assertion : Assertion → Node
  | showDeclaration : ShowDeclaration → Node
  | text : Text → Node

end


mutual

public partial def Section.toJson (s : Section) : Json :=
  SchemaFor.structure.toJson
    [.single toJson "id" Section.id,
     .single toJson "title" Section.title,
     .arr Node.toJson "children" Section.children] s

public partial def Node.toJson (n : Node) : Json :=
  SchemaFor.inductive.toJson
    [.unary "section" Section (fun | .section s => some s | _ => none) Section.toJson,
     .unary "associationTable" AssociationTable (fun | .associationTable a => some a | _ => none),
     .unary "table" Table (fun | .table t => some t | _ => none),
     .unary "namespace" String (fun | .namespace s => some s | _ => none),
     .unary "assertion" Assertion (fun | .assertion a => some a | _ => none),
     .unary "showDeclaration" ShowDeclaration (fun | .showDeclaration s => some s | _ => none),
     .unary "text" Text (fun | .text t => some t | _ => none)] n

end

end

public instance : SchemaFor Section :=
  .structure "section"
    [.single "id" Section.id,
     .single "title" Section.title,
     .backArr "node" Node.toJson "children" Section.children]

public instance : SchemaFor Node :=
  .inductive "node"
    [.unary "section" Section (fun | .section s => some s | _ => none),
     .unary "associationTable" AssociationTable (fun | .associationTable a => some a | _ => none),
     .unary "table" Table (fun | .table t => some t | _ => none),
     .unary "namespace" String (fun | .namespace s => some s | _ => none),
     .unary "assertion" Assertion (fun | .assertion a => some a | _ => none),
     .unary "showDeclaration" ShowDeclaration (fun | .showDeclaration s => some s | _ => none),
     .unary "text" Text (fun | .text t => some t | _ => none)]

public structure Project where
  projectNamespace : String
  hash : String.Slice
  rootNode : Node
  declarations : Array Data.Declaration

public instance : SchemaFor Project :=
  .structure "project"
    [.single "projectNamespace" Project.projectNamespace,
     .single "hash" Project.hash,
     .single "rootNode" Project.rootNode,
     .arr "declarations" Project.declarations]

public structure InvalidatedFact where
  widgetId : String
  factId : String

public instance : SchemaFor InvalidatedFact :=
  .structure "invalidatedFact"
    [.single "widgetId" InvalidatedFact.widgetId,
     .single "factId" InvalidatedFact.factId]

public structure InvalidatedFacts where
  invalidatedFacts : Array InvalidatedFact

public instance : SchemaFor InvalidatedFacts :=
  .structure "invalidatedFacts"
    [.arr "invalidatedFacts" InvalidatedFacts.invalidatedFacts]

end Data

def processTheorem (t : Theorem) : Data.Theorem :=
  { t with name := t.name.toString }

def processDefinition (d : Definition) : Data.Definition :=
  { d with name := d.name.toString }

def processDeclaration : Declaration → Data.Declaration
  | .thm t => .thm (processTheorem t)
  | .def d => .def (processDefinition d)
  | .missing n => .missing n.toString

def processShowDeclaration (s : ShowDeclaration) : RenderM Data.ShowDeclaration := do
  let decl ← getDeclaration s.name
  let facts ← ((← findShowDeclarationFacts? s.id).getD #[]).mapM (processFact s.id decl)
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
    let validationResult := f.validate decl
    return {
      widgetId := widgetId
      factId := f.factId
      metadata := f.metadata
      state := processDeclaration f.state
      validationResult
    }

def processText (t : Text) : Data.Text :=
  { t with }

partial def processNode : Node → RenderM Data.Node
  | .section id title nodes => (.section ⟨id, title, ·⟩) <$> nodes.mapM processNode
  | Node.associationTable t => Data.Node.associationTable <$> processAssociationTable t
  | Node.table t => Data.Node.table <$> processTable t
  | .namespace n => pure <| .namespace n.toString
  | .assertion a => Data.Node.assertion <$> processAssertion a
  | .showDeclaration s => Data.Node.showDeclaration <$> processShowDeclaration s
  | .text s => pure <| .text (processText s)

def processProject (p : Project) : MetaM Data.Project := do
  let (rootNode, renderState) ← (processNode p.rootNode).run p.restoreState.run

  return {
    projectNamespace := p.config.projectNamespace.toString
    hash := ← p.config.getHash
    rootNode := rootNode
    declarations := renderState.declarations.valuesArray.map processDeclaration
  }

public structure RenderResult where
  fullOutput : String
  invalidatedFacts : String

partial def Data.Project.collectInvalidatedFacts (p : Data.Project) : InvalidatedFacts :=
  ⟨((explore p.rootNode).run #[]).2⟩
where
  explore (n : Data.Node) : StateM (Array InvalidatedFact) PUnit := do
    match n with
    | .section s => s.children.forM explore
    | .associationTable t => exploreFacts t.facts
    | .table t => exploreFacts t.facts
    | .namespace _ => return ()
    | .assertion a => exploreFacts a.facts
    | .showDeclaration s => s.facts.forM (exploreShowDeclarationFact s.definition.id)
    | .text _ => return ()
  exploreFacts {α : Type} [ValidatedFact α] (facts : Array α) :
      StateM (Array InvalidatedFact) PUnit := facts.forM fun f => do
    if ValidatedFact.validationResult f matches .invalidated _ then
      modify (·.push ⟨ValidatedFact.widgetId f, ValidatedFact.factId f⟩)

  -- TODO: switch over to exploreFacts
  exploreShowDeclarationFact (widgetId : String) (s : Data.ShowDeclaration.Fact) : StateM (Array InvalidatedFact) PUnit := do
    if s.validationResult matches .invalidated _ then
      modify (·.push ⟨widgetId, s.factId⟩)

def Data.Project.render (p : Data.Project) : RenderResult where
  fullOutput := toString (toJson p)
  invalidatedFacts := toString (toJson p.collectInvalidatedFacts)

partial def Data.Project.validate (p : Data.Project) : Except String Data.Project :=
  let duplicateIds := ((explore p.rootNode).run (∅, ∅)).2.2.toArray
  if duplicateIds.isEmpty then
    Except.ok p
  else
    Except.error s!"There were duplicate ids: {duplicateIds}"
where
  explore (n : Data.Node) : StateM (Std.HashSet String × Std.HashSet String) PUnit := do
    match n with
    | .section s =>
        register s.id
        s.children.forM explore
    | .associationTable t => register t.definition.widgetId
    | .table t => register t.definition.widgetId
    | .namespace n => register n
    | .assertion a => register a.definition.widgetId
    | .showDeclaration s => register s.definition.id
    | .text t => register t.id
  register (id : String) : StateM (Std.HashSet String × Std.HashSet String) PUnit :=
    modify (fun (once, twice) => if id ∈ once then (once, twice.insert id) else (once.insert id, twice))

public def render (p : Project) : MetaM (Except String RenderResult) := do
  (Except.map (·.render) ∘ Data.Project.validate) <$> processProject p

end Full

end Grove.Framework.Backend
