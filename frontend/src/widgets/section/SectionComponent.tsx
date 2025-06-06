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
    return <span className="text-xl">{text}</span>;
  } else if (depth === 1) {
    return <span className="text-lg">{text}</span>;
  } else if (depth === 2) {
    return <span className="font-bold">h3: {text}</span>;
  } else {
    return <span className="font-bold">h4: {text}</span>;
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
    <div className="p-1">
      <SectionHeader text={section.title} depth={depth} />
      <div className="border-1 border-gray-300 rounded-sm p-1">
        {section.children.map((node) => (
          <NodeComponent key={nodeKey(node)} node={node} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}
