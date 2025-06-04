/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Data.Json.FromToJson
import Std.Data.HashMap

open Lean

namespace StdMetadata.JTD

inductive PrimitiveType where
  | boolean
  | string
  | timestamp
  | float32
  | float64
  | int8
  | uint8
  | int16
  | uint16
  | int32
  | uint32

def PrimitiveType.toString : PrimitiveType → String
  | boolean => "boolean"
  | string => "string"
  | timestamp => "timestamp"
  | float32 => "float32"
  | float64 => "float64"
  | int8 => "int8"
  | uint8 => "uint8"
  | int16 => "int16"
  | uint16 => "uint16"
  | int32 => "int32"
  | uint32 => "uint32"

mutual

structure Property where
  name : String
  s : Schema

structure DiscriminatorCase where
  discriminatorValue : String
  s : Option Schema

inductive Schema where
  | empty : Schema
  | type : PrimitiveType → Schema
  | enum : List String → Schema
  | elements :  Schema → Schema
  -- /-- Optional and extra properties are not supported at the moment. -/
  | properties : List Property → Schema
  | discriminator : String → List DiscriminatorCase → Schema
  | ref : String → Schema

end

instance : Inhabited Schema where
  default := .empty

def Schema.toJson : Schema → List (String × Json)
  | .empty => []
  | .type p => [("type", p.toString)]
  | .enum l => [("enum", .arr (l.toArray.map Json.str))]
  | .elements s => [("elements", .mkObj s.toJson)]
  | .properties p => [("properties", .mkObj (p.map propJson))]
  | .discriminator s cases =>  [("discriminator", s), ("mapping", .mkObj (cases.map discJson))]
  | .ref s => [("ref", s)]
where
  propJson : Property → String × Json
    | .mk name s => (name, .mkObj s.toJson)
  discJson : DiscriminatorCase → String × Json
    | .mk discriminatorValue s => (discriminatorValue,
      match s with
      | none => .mkObj [("optionalProperties", .mkObj [(discriminatorValue, .mkObj [])])]
      | some s => .mkObj [("properties", .mkObj [(discriminatorValue, .mkObj s.toJson)])])

instance : ToJson Schema where
  toJson := .mkObj ∘ Schema.toJson

class SchemaFor (α : Type u) where
  addDependencies : Std.HashMap String Schema → Std.HashMap String Schema
  schema : Schema
  toJson : α → Json
deriving Inhabited

def schemaJson (α : Type u) [SchemaFor α] : Json :=
  let defs := (SchemaFor.addDependencies α ∅).toList.map (fun p => (p.1, Json.mkObj p.2.toJson))
  let defKeys := if defs.isEmpty then [] else [("definitions", Json.mkObj defs)]
  .mkObj ((SchemaFor.schema α).toJson ++ defKeys)

instance (priority := low) {α : Type u} [SchemaFor α] : ToJson α where
  toJson := SchemaFor.toJson

instance : SchemaFor String where
  addDependencies m := m
  schema := .type .string
  toJson := toJson

instance : SchemaFor Bool where
  addDependencies m := m
  schema := .type .boolean
  toJson := toJson

def SchemaFor.enum {α : Type u} [ToString α] (name : String) (values : List α) : SchemaFor α where
  addDependencies m := m.insert name (.enum (values.map toString))
  schema := .ref name
  toJson := .str ∘ toString

inductive JsonStructureField (α : Type u) where
  | single {β : Type u} (toJson : β → Json := by exact toJson) (name : String) (proj : α → β) : JsonStructureField α
  | arr {β : Type u} (toJson : β → Json := by exact toJson) (name : String) (proj : α → Array β) : JsonStructureField α

inductive StructureField (α : Type u) where
  | single {β : Type u} [SchemaFor β] (name : String) (proj : α → β) : StructureField α
  | arr {β : Type u} [SchemaFor β] (name : String) (proj : α → Array β) : StructureField α
  | backArr (refName : String) {β : Type u} (toJson : β → Json := by exact toJson) (name : String) (proj : α → Array β) : StructureField α

def StructureField.toJsonStructureField {α : Type u} : StructureField α → JsonStructureField α
  | @StructureField.single _ _ _ name proj => JsonStructureField.single toJson name proj
  | @StructureField.arr _ _ _ name proj => JsonStructureField.arr toJson name proj
  | @StructureField.backArr _ _ _ toJson name proj => JsonStructureField.arr toJson name proj

def JsonStructureField.toJsonProperty {α : Type u} : JsonStructureField α → α → String × Json
  | .single toJson name proj, a => (name, toJson (proj a))
  | .arr toJson name proj, a => (name, .arr ((proj a).map toJson))

def StructureField.toProperty {α : Type u} : StructureField α → Property
  | @StructureField.single _ β _ name _ => ⟨name, SchemaFor.schema β⟩
  | @StructureField.arr _ β _ name _ => ⟨name, .elements (SchemaFor.schema β)⟩
  | @StructureField.backArr _ refName _ _ name _ => ⟨name, .elements (.ref refName)⟩

def StructureField.addDependencies {α : Type u} : StructureField α → Std.HashMap String Schema → Std.HashMap String Schema
  | @StructureField.single _ β _ _ _, m => SchemaFor.addDependencies β m
  | @StructureField.arr _ β _ _ _, m => SchemaFor.addDependencies β m
  | @StructureField.backArr _ _ _ _ _ _, m => m

def SchemaFor.structure.toJson {α : Type u} (fields : List (JsonStructureField α)) (a : α) : Json :=
  .mkObj (fields.map (fun f => f.toJsonProperty a))

def SchemaFor.structure {α : Type u} (name : String) (fields : List (StructureField α)) : SchemaFor α where
  addDependencies m :=
    if name ∈ m then
      m
    else
      let m := m.insert name .empty
      let upstream : Std.HashMap String Schema := (fields.foldl (init := m) (fun sofar f => f.addDependencies sofar))
      upstream.insert name (.properties (fields.map StructureField.toProperty))
  schema := .ref name
  toJson := SchemaFor.structure.toJson (fields.map StructureField.toJsonStructureField)

inductive JsonConstructor (α : Type u) where
  | nullary : String → (is? : α → Bool) → JsonConstructor α
  | unary : (name : String) → (β : Type u) → (get? : α → Option β) → (toJson : β → Json := by exact toJson) → JsonConstructor α

inductive Constructor (α : Type u) where
  | nullary : String → (is? : α → Bool) → Constructor α
  | unary : (name : String) → (β : Type u) → (get? : α → Option β) → (schema : SchemaFor β := by infer_instance) → Constructor α

def Constructor.toJsonConstructor {α : Type u} : Constructor α → JsonConstructor α
  | .nullary name is? => .nullary name is?
  | .unary name _ get? _ => .unary name _ get?

def Constructor.addDependencies {α : Type u} : Constructor α → Std.HashMap String Schema → Std.HashMap String Schema
  | .nullary _ _, m => m
  | .unary _ β _ _ , m => SchemaFor.addDependencies β m

def Constructor.toDiscriminatorCase {α : Type u} : Constructor α → DiscriminatorCase
  | .nullary name _ => ⟨name, none⟩
  | .unary name β _ _ => ⟨name, some (SchemaFor.schema β)⟩

def JsonConstructor.toJson? {α : Type u} : JsonConstructor α → α → Option Json
  | .nullary name is?, a => if is? a then some (.mkObj [("constructor", name), (name, .mkObj [])]) else none
  | .unary name _ get? toJson, a => (get? a).map (fun b => .mkObj [("constructor", name), (name, toJson b)])

def SchemaFor.inductive.toJson {α : Type u} (constructors : List (JsonConstructor α)) (a : α) : Json := Id.run do
  for c in constructors do
    if let some json := c.toJson? a then
      return json
  panic! "No matching constructor found"

def SchemaFor.inductive {α : Type u} (name : String) (constructors : List (Constructor α)) : SchemaFor α where
  addDependencies m :=
    if name ∈ m then
      m
    else
      let m := m.insert name .empty
      let upstream : Std.HashMap String Schema := (constructors.foldl (init := m) (fun sofar f => f.addDependencies sofar))
      upstream.insert name (.discriminator "constructor" (constructors.map Constructor.toDiscriminatorCase))
  schema := .ref name
  toJson := SchemaFor.inductive.toJson (constructors.map Constructor.toJsonConstructor)

end StdMetadata.JTD
