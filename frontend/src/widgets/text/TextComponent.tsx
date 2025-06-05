import { JSX } from "react";

export function TextComponent({ text }: { text: string }): JSX.Element {
  return <p>{text}</p>;
}
