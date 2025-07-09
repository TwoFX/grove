/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/

namespace Grove.Markdown

inductive Paragraph where
  | text : String → Paragraph
  | codeBlock : String → Paragraph

instance : Coe String Paragraph where
  coe := .text

def Paragraph.render : Paragraph → String
  | text t => t
  | codeBlock c => s!"```\n{c}{if c.endsWith "\n" then "" else "\n"}```"

def render (l : List Paragraph) : String :=
  String.intercalate "\n\n" (l.map Paragraph.render)

end Grove.Markdown
