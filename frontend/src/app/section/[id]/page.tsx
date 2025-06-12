import { groveContextData } from "@/lib/transfer/metadata";
import { SectionComponent } from "@/widgets/section/SectionComponent";

export async function generateStaticParams() {
  return Object.keys(groveContextData.section).map((key) => ({ id: key }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const section = groveContextData.section[id];

  if (!section) {
    throw new Error("Unknown section");
  }

  return <SectionComponent section={section} depth={0} />;
}
