"use client";

import { BreadcrumbContext } from "@/lib/navigate/breadcrumb";
import { GroveContext } from "@/lib/transfer/context";
import { SectionComponent } from "@/widgets/section/SectionComponent";
import { JSX, useContext, useEffect } from "react";

export function SectionPage({ sectionId }: { sectionId: string }): JSX.Element {
  const groveContext = useContext(GroveContext);
  const { setBreadcrumb } = useContext(BreadcrumbContext);

  const section = groveContext.section[sectionId];

  if (!section) {
    throw new Error("Unknown section");
  }

  useEffect(() => {
    setBreadcrumb({
      id: section.id,
      title: section.title,
    });
  }, [setBreadcrumb, section]);

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <SectionComponent section={section} depth={0} />
    </div>
  );
}
