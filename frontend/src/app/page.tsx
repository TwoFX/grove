import { rootNode } from "@/lib/transfer/metadata";
import { NodeComponent } from "@/widgets/NodeComponent";

export default async function Home() {
  return <NodeComponent node={rootNode} depth={0} />;
}
