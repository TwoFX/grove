import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import { PersistenceGate } from "./components/PersistenceGate";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistenceGate>
      <RouterProvider router={router} />
    </PersistenceGate>
  </StrictMode>,
);
