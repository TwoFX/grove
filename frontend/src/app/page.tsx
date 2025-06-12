"use client";
import { GroveContext } from "@/lib/transfer/context";
import { NodeComponent } from "@/widgets/NodeComponent";
import { useContext } from "react";

export default function Home() {
  const context = useContext(GroveContext);

  return <NodeComponent node={context.rootNode} depth={0} />;
}
