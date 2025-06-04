/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Data.Json.Basic

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

inductive Property : Type → Type 1 where
  | mk : (name : String) → (β : Type) → (proj : α → β) → (s : Schema β) → Property α

inductive PropertyList : Type → Type 1 where
  | nil : PropertyList α
  | cons : Property α → PropertyList α → PropertyList α

inductive DiscriminatorCase : Type → Type 1 where
  | mk : (discriminatorValue : String) → (β : Type) → (toCase? : α → Option β) → (s : Schema β) → DiscriminatorCase α

inductive DiscriminatorCaseList : Type → Type 1 where
  | nil : DiscriminatorCaseList α
  | cons : DiscriminatorCase α → DiscriminatorCaseList α → DiscriminatorCaseList α

inductive Schema : Type → Type 1 where
  | empty : Schema α
  | type : PrimitiveType → (α → String) → Schema α
  | enum : List String → (α → String) → Schema α
  | elements {β : Type} : (α → Array β) → Schema β → Schema α
  -- /-- Optional and extra properties are not supported at the moment. -/
  | properties : PropertyList α → Schema α
  | discriminator : String → DiscriminatorCaseList α → Schema α
  | ref : String → Schema α

end

def Schema.toJson : Schema α → α → Json := sorry

def Schema.schemaJson : Schema α → Json
  | .empty => .mkObj []
  | .type p _ => .mkObj [("type", p.toString)]
  | .enum l _ => .mkObj [("enum", .arr (l.toArray.map Json.str))]
  | .elements _ s => .mkObj [("elements", s.schemaJson)]
  | .properties p => .mkObj [("properties", .mkObj (propsJson p))]
  | .discriminator s cases => .mkObj [("discriminator", s), ("mapping", .mkObj (discsJson cases))]
  | .ref s => .mkObj [("ref", s)]
where
  propJson : Property α → String × Json
    | .mk name _ _ s => (name, s.schemaJson)
  propsJson : PropertyList α → List (String × Json)
    | .nil => []
    | .cons p ps => propJson p :: propsJson ps
  discJson : DiscriminatorCase α → String × Json
    | .mk discriminatorValue _ _ s => (discriminatorValue, .mkObj [("properties", .mkObj [(discriminatorValue, s.schemaJson)])])
  discsJson : DiscriminatorCaseList α → List (String × Json)
    | .nil => []
    | .cons p ps => discJson p :: discsJson ps


end StdMetadata.JTD
