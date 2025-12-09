/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module
namespace Grove.Markdown

public inductive Paragraph where
  | h1 : String → Paragraph
  | h2 : String → Paragraph
  | h3 : String → Paragraph
  | text : String → Paragraph
  | codeBlock : String → Paragraph
  | blockQuote : String → Paragraph

public instance : Coe String Paragraph where
  coe := .text

def Paragraph.render : Paragraph → String
  | h1 t => s!"# {t}"
  | h2 t => s!"## {t}"
  | h3 t => s!"### {t}"
  | text t => t
  | codeBlock c => s!"```\n{c}{if c.endsWith "\n" then "" else "\n"}```"
  | blockQuote b => String.intercalate "\n" <| List.map ("> " ++ ·) <| b.splitOn "\n"

public def render (l : List Paragraph) : String :=
  String.intercalate "\n\n" (l.map Paragraph.render)

end Grove.Markdown
