import { groveContextData } from "@/lib/transfer/metadata";
import { SectionComponent } from "@/widgets/section/SectionComponent";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  return [
    // Workaround for https://github.com/vercel/next.js/issues/71862
    { id: "__grove_dummy" },
    ...Object.keys(groveContextData.section).map((key) => ({ id: key })),
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

  const section = groveContextData.section[id];

  if (!section) {
    throw new Error("Unknown section");
  }

  return <SectionComponent section={section} depth={0} />;
}
