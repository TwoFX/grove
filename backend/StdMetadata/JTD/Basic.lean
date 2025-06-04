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
  s : Schema

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
    | .mk discriminatorValue s => (discriminatorValue, .mkObj [("properties", .mkObj [(discriminatorValue, .mkObj s.toJson)])])

instance : ToJson Schema where
  toJson := .mkObj ∘ Schema.toJson

class SchemaFor (α : Type u) where
  dependencies : Std.HashMap String Schema
  schema : Schema
  toJson : α → Json

def schemaJson (α : Type u) [SchemaFor α] : Json :=
  let defs := (SchemaFor.dependencies α).toList.map (fun p => (p.1, Json.mkObj p.2.toJson))
  let defKeys := if defs.isEmpty then [] else [("definitions", Json.mkObj defs)]
  .mkObj ((SchemaFor.schema α).toJson ++ defKeys)

instance (priority := low) {α : Type u} [SchemaFor α] : ToJson α where
  toJson := SchemaFor.toJson

instance : SchemaFor String where
  dependencies := ∅
  schema := .type .string
  toJson := .str

def SchemaFor.enum {α : Type u} [ToString α] (name : String) (values : List α) : SchemaFor α where
  dependencies := .ofList [(name, .enum (values.map toString))]
  schema := .ref name
  toJson := .str ∘ toString

inductive StructureField (α : Type u) where
  | single {β : Type u} [SchemaFor β] (name : String) (proj : α → β) : StructureField α
  | arr {β : Type u} [SchemaFor β] (name : String) (proj : α → Array β) : StructureField α

def StructureField.toJsonProperty {α : Type u} : StructureField α → α → String × Json
  | @StructureField.single _ _ _ name proj, a => (name, toJson (proj a))
  | @StructureField.arr _ _ _ name proj, a => (name, .arr ((proj a).map toJson))

def StructureField.toProperty {α : Type u} : StructureField α → Property
  | @StructureField.single _ β _ name _ => ⟨name, SchemaFor.schema β⟩
  | @StructureField.arr _ β _ name _ => ⟨name, .elements (SchemaFor.schema β)⟩

def StructureField.addDependencies {α : Type u} : StructureField α → Std.HashMap String Schema → Std.HashMap String Schema
  | @StructureField.single _ β _ _ _, m => m.union (SchemaFor.dependencies β)
  | @StructureField.arr _ β _ _ _, m => m.union (SchemaFor.dependencies β)

def SchemaFor.structure {α : Type u} (name : String) (fields : List (StructureField α)) : SchemaFor α where
  dependencies :=
    let upstream : Std.HashMap String Schema := (fields.foldl (init := ∅) (fun sofar f => f.addDependencies sofar))
    upstream.insert name (.properties (fields.map StructureField.toProperty))
  schema := .ref name
  toJson a := .mkObj (fields.map (fun f => f.toJsonProperty a))

structure Constructor (α : Type u) where
  name : String
  β : Type u
  get? : α → Option β
  schema : SchemaFor β := by infer_instance

instance {α : Type u} (c : Constructor α) : SchemaFor c.β :=
  Constructor.schema c

def Constructor.addDependencies {α : Type u} (c : Constructor α) (m : Std.HashMap String Schema) : Std.HashMap String Schema :=
  m.union (SchemaFor.dependencies c.β)

def Constructor.toDiscriminatorCase {α : Type u} (c : Constructor α) : DiscriminatorCase where
  discriminatorValue := c.name
  s := SchemaFor.schema c.β

def Constructor.toJson? {α : Type u} (c : Constructor α) (a : α) : Option Json :=
  (c.get? a).map (fun b => .mkObj [("constructor", c.name), (c.name, toJson b)])

def SchemaFor.inductive {α : Type u} (name : String) (constructors : List (Constructor α)) : SchemaFor α where
  dependencies :=
    let upstream : Std.HashMap String Schema := (constructors.foldl (init := ∅) (fun sofar f => f.addDependencies sofar))
    upstream.insert name (.discriminator "constructor" (constructors.map Constructor.toDiscriminatorCase))
  schema := .ref name
  toJson a := Id.run do
    for c in constructors do
      if let some json := c.toJson? a then
        return json
    panic! "No matching constructor found"

end StdMetadata.JTD
