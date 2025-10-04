import { Demo } from "@repo/shared";
import { LandingPage } from "@repo/shared/dist/server";
import type { ReactNode } from "react";
import ProsemirrorMermaidDemo from "./prose-mermaid-demo";

export const metadata = {
  title: "Prosemirror Mermaid",
};

/** next.js landing page */
export default function Page(): ReactNode {
  return (
    <LandingPage title="Next.js Example">
      <ProsemirrorMermaidDemo />
    </LandingPage>
  );
}
