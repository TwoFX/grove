import { Text } from "@/lib/transfer/project";
import { JSX } from "react";
import Markdown from "react-markdown";

export function TextComponent({ text }: { text: Text }): JSX.Element {
  return <Markdown>{text.content}</Markdown>;
}
