import type { Metadata } from "next";
import ReviewWorkbench from "@/components/ReviewWorkbench";

export const metadata: Metadata = {
  title: "Review workbench — Devfolio Advisor",
  description: "Explore a repository review, inspect its evidence and run deterministic output checks. No sign-in required.",
};

export default function DemoPage() {
  return <ReviewWorkbench />;
}
