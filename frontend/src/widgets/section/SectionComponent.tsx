"use client";

import { Section } from "@/transfer";
import { JSX } from "react";
import { NodeComponent } from "../NodeComponent";
import { nodeKey } from "@/transfer/util";
import { BsChevronDown } from "react-icons/bs";
import { useGroveStore } from "@/state/state";

function SectionHeader({
  text,
  depth,
  isCollapsed,
  onToggle,
}: {
  text: string;
  depth: number;
  isCollapsed: boolean;
  onToggle: () => void;
}): JSX.Element {
  const headerContent = () => {
    if (depth === 0) {
      return <span className="text-xl">{text}</span>;
    } else if (depth === 1) {
      return <span className="text-lg">{text}</span>;
    } else if (depth === 2) {
      return <span className="font-bold">h3: {text}</span>;
    } else {
      return <span className="font-bold">h4: {text}</span>;
    }
  };

  return (
    <div
      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
      onClick={onToggle}
    >
      <BsChevronDown
        className={`${!isCollapsed ? "" : "-rotate-90"} ${
          depth === 0 ? "text-xl" : depth === 1 ? "text-lg" : "text-base"
        }`}
      />
      {headerContent()}
    </div>
  );
}

export function SectionComponent({
  section,
  depth,
}: {
  section: Section;
  depth: number;
}): JSX.Element {
  const isCollapsed = useGroveStore((state) => state.collapsed[section.id]);
  const toggleCollapsed = useGroveStore((state) => state.toggleCollapsed);

  return (
    <div className="m-1">
      <SectionHeader
        text={section.title}
        depth={depth}
        isCollapsed={isCollapsed}
        onToggle={() => toggleCollapsed(section.id)}
      />
      {!isCollapsed && (
        <div className="border-1 border-gray-300 p-1 space-y-1">
          {section.children.map((node) => (
            <NodeComponent key={nodeKey(node)} node={node} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
