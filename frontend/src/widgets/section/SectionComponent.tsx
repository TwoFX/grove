import { Section } from "@/transfer";
import { JSX } from "react";
import { NodeComponent } from "../NodeComponent";
import { nodeKey } from "@/transfer/metadata";

function SectionHeader({
  text,
  depth,
}: {
  text: string;
  depth: number;
}): JSX.Element {
  if (depth === 0) {
    return <h1>h1: {text}</h1>;
  } else if (depth === 1) {
    return <h2>h2: {text}</h2>;
  } else if (depth === 2) {
    return <h3>h3: {text}</h3>;
  } else {
    return <h4>h4: {text}</h4>;
  }
}

export function SectionComponent({
  section,
  depth,
}: {
  section: Section;
  depth: number;
}): JSX.Element {
  return (
    <div>
      <SectionHeader text={section.title} depth={depth} />
      {section.children.map((node) => (
        <NodeComponent key={nodeKey(node)} node={node} depth={depth + 1} />
      ))}
    </div>
  );
}
