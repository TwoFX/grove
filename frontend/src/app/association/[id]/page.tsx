import { groveContextData } from "@/lib/transfer/metadata";
import { JSX } from "react";
import { AssociationTablePage } from "./AssociationTablePage";

export async function generateStaticParams() {
  return groveContextData.associationTableDefinition.all.map((def) => {
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

  return <AssociationTablePage widgetId={id} />;
}
