"use client";

import { IconContext } from "@phosphor-icons/react";

export function DashboardIconProvider({ children }: { children: React.ReactNode }) {
  return (
    <IconContext.Provider value={{ weight: "regular" }}>
      {children}
    </IconContext.Provider>
  );
}
