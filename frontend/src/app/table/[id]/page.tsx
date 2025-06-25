import { JSX } from "react";
import { TablePage } from "./TablePage";
import { groveContextData } from "@/lib/transfer/metadata";

export async function generateStaticParams() {
  console.log("Hello");
  return groveContextData.tableDefinition.all.map((def) => {
    return {
      id: def.widgetId,
    };
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;

  return <TablePage widgetId={id} />;
}
