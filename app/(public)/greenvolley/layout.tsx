import type { ReactNode } from "react";
import GreenVolleySubNav from "./_sub-nav";

export default function GreenVolleyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GreenVolleySubNav />
      {children}
    </>
  );
}
