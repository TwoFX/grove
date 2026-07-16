import { GroveClient } from "@/components/GroveClient";
import { HeaderBar } from "@/components/header/HeaderBar";
import { JSX } from "react";
import { Outlet } from "react-router";

export function RootLayout(): JSX.Element {
  return (
    <GroveClient>
      <div className="h-dvh flex flex-col">
        <header className="flex-none">
          <HeaderBar />
        </header>
        <main className="flex-auto h-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    </GroveClient>
  );
}
