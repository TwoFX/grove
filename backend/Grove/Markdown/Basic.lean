/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module
namespace Grove.Markdown

public inductive Paragraph where
  | text : String → Paragraph
  | codeBlock : String → Paragraph
  | blockQuote : String → Paragraph

public instance : Coe String Paragraph where
  coe := .text

def Paragraph.render : Paragraph → String
  | text t => t
  | codeBlock c => s!"```\n{c}{if c.endsWith "\n" then "" else "\n"}```"
  | blockQuote b => String.intercalate "\n" <| List.map ("> " ++ ·) <| b.splitOn "\n"

public def render (l : List Paragraph) : String :=
  String.intercalate "\n\n" (l.map Paragraph.render)

end Grove.Markdown
