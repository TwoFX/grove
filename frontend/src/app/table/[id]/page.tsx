import { JSX } from "react";
import { TablePage } from "./TablePage";
import { redirect } from "next/navigation";
import { serverContextData } from "@/lib/transfer/server";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [
    // Workaround for https://github.com/vercel/next.js/issues/71862
    { id: "__grove_dummy" },
    ...serverContextData.tableDefinition.all.map((def) => {
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

  return <TablePage widgetId={id} />;
}
