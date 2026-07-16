import { GroveContext } from "@/lib/transfer/context";
import { JSX, useContext } from "react";
import { useParams } from "react-router";
import { AssertionPage } from "./AssertionPage";
import { AssociationTablePage } from "./AssociationTablePage";
import { FactPage } from "./FactPage";
import { NotFound } from "./NotFound";
import { SectionPage } from "./SectionPage";
import { TablePage } from "./TablePage";

export function SectionRoute(): JSX.Element {
  const { id } = useParams();
  const context = useContext(GroveContext);
  if (!id || !context.section[id]) {
    return <NotFound kind="Section" id={id} />;
  }
  return <SectionPage sectionId={id} />;
}

export function FactsRoute(): JSX.Element {
  const { id } = useParams();
  const context = useContext(GroveContext);
  if (!id || !context.section[id]) {
    return <NotFound kind="Section" id={id} />;
  }
  return <FactPage sectionId={id} />;
}

export function AssertionRoute(): JSX.Element {
  const { id } = useParams();
  const context = useContext(GroveContext);
  if (!id || !context.assertionDefinition.byId[id]) {
    return <NotFound kind="Assertion" id={id} />;
  }
  return <AssertionPage widgetId={id} />;
}

export function AssociationRoute(): JSX.Element {
  const { id } = useParams();
  const context = useContext(GroveContext);
  if (!id || !context.associationTableDefinition.byId[id]) {
    return <NotFound kind="Association table" id={id} />;
  }
  return <AssociationTablePage widgetId={id} />;
}

export function TableRoute(): JSX.Element {
  const { id } = useParams();
  const context = useContext(GroveContext);
  if (!id || !context.tableDefinition.byId[id]) {
    return <NotFound kind="Table" id={id} />;
  }
  return <TablePage widgetId={id} />;
}
