"use client";
import { GroveContext } from "@/lib/transfer/context";
import { NodeComponent } from "@/widgets/NodeComponent";
import { useContext } from "react";

export default function Home() {
  const context = useContext(GroveContext);

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <NodeComponent node={context.rootNode} depth={0} />
    </div>
  );
}
