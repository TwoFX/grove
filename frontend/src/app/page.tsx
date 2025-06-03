import { rootNode } from "@/transfer/metadata";

export default async function Home() {
  return <p>Here be dragons: {JSON.stringify(rootNode)}</p>;
}
