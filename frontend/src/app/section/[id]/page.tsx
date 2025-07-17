import { redirect } from "next/navigation";
import { SectionPage } from "./SectionPage";
import { serverContextData } from "@/lib/transfer/server";

export async function generateStaticParams() {
  return [
    // Workaround for https://github.com/vercel/next.js/issues/71862
    { id: "__grove_dummy" },
    ...Object.keys(serverContextData.section).map((key) => ({ id: key })),
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "__grove_dummy") {
    redirect("https://www.youtube.com/watch?v=94JDIBZhSBM");
  }

  return <SectionPage sectionId={id} />;
}
