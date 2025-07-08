import { JSX } from "react";
import Markdown from "react-markdown";

export function TextComponent({ text }: { text: string }): JSX.Element {
  return <Markdown>{text}</Markdown>;
}
