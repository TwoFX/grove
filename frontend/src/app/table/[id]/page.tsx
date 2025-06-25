import { JSX } from "react";
import { TablePage } from "./TablePage";
import { groveContextData } from "@/lib/transfer/metadata";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const result = groveContextData.tableDefinition.all.map((def) => {
    return {
      id: def.widgetId,
    };
  });
  console.log(result);
  return result;
}

export default async function Home({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;

  return <TablePage widgetId={id} />;
}
