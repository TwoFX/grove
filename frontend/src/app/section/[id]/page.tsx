import { sectionMap } from "@/transfer/metadata";
import { SectionComponent } from "@/widgets/section/SectionComponent";

export async function generateStaticParams() {
    return sectionMap.keys().map((key) => ({ id: key }));
}

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    
    const section = sectionMap.get(id);

    if (!section) {
        throw new Error("Unknown section");
    }

    return <SectionComponent section={section} depth={0} />;
}