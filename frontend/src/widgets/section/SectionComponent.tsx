"use client";

import { Section } from "@/lib/transfer/project";
import { JSX, useState } from "react";
import { NodeComponent } from "../NodeComponent";
import { nodeKey } from "@/lib/transfer/util";
import { BsChevronDown } from "react-icons/bs";
import { FiLink } from "react-icons/fi";
import { useGroveStore } from "@/lib/state/state";
import Link from "next/link";

function SectionHeader({
  text,
  depth,
  isExpanded,
  onToggle,
  alwaysExpand,
  sectionId,
}: {
  text: string;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
  alwaysExpand: boolean;
  sectionId: string;
}): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);

  const headerContent = () => {
    if (depth === 0) {
      return <span className="text-xl">{text}</span>;
    } else if (depth === 1) {
      return <span className="text-lg">{text}</span>;
    } else if (depth === 2) {
      return <span className="font-bold">{text}</span>;
    } else {
      return <span className="font-bold">{text}</span>;
    }
  };

  return (
    <div
      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!alwaysExpand) {
          onToggle();
        }
      }}
    >
      {!alwaysExpand && (
        <BsChevronDown
          className={`${isExpanded ? "" : "-rotate-90"} ${
            depth === 0 ? "text-xl" : depth === 1 ? "text-lg" : "text-base"
          }`}
        />
      )}
      {headerContent()}
      {isHovered && (
        <Link
          href={`/section/${sectionId}`}
          onClick={(e) => e.stopPropagation()}
        >
          <FiLink
            className={`${
              depth === 0 ? "text-xl" : depth === 1 ? "text-lg" : "text-base"
            } text-gray-500 hover:text-blue-600`}
          />
        </Link>
      )}
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
  const isExpanded = useGroveStore((state) => state.expanded[section.id]);
  const toggleExpanded = useGroveStore((state) => state.toggleExpanded);

  const alwaysExpand = depth === 0;

  return (
    <div className="m-1">
      <SectionHeader
        text={section.title}
        depth={depth}
        isExpanded={isExpanded}
        onToggle={() => toggleExpanded(section.id)}
        alwaysExpand={alwaysExpand}
        sectionId={section.id}
      />
      {(alwaysExpand || isExpanded) && (
        <div className="border-1 border-gray-300 p-2 space-y-1">
          {section.children.map((node) => (
            <NodeComponent key={nodeKey(node)} node={node} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
