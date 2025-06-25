import { groveContextData } from "@/lib/transfer/metadata";
import { JSX } from "react";
import { AssociationTablePage } from "./AssociationTablePage";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  return [
    // Workaround for https://github.com/vercel/next.js/issues/71862
    { id: "__grove_dummy" },
    ...groveContextData.associationTableDefinition.all.map((def) => {
      return {
        id: def.widgetId,
      };
    }),
  ];
}

export default async function Home({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;

  if (id === "__grove_dummy") {
    redirect("https://www.youtube.com/watch?v=94JDIBZhSBM");
  }

  return <AssociationTablePage widgetId={id} />;
}
