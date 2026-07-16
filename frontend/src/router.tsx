import { createHashRouter } from "react-router";
import Home from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { RootLayout } from "./pages/RootLayout";
import { RouteError } from "./pages/RouteError";
import {
  AssertionRoute,
  AssociationRoute,
  FactsRoute,
  SectionRoute,
  TableRoute,
} from "./pages/routes";

export const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: "section/:id", element: <SectionRoute /> },
      { path: "facts/:id", element: <FactsRoute /> },
      { path: "assertion/:id", element: <AssertionRoute /> },
      { path: "association/:id", element: <AssociationRoute /> },
      { path: "table/:id", element: <TableRoute /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
