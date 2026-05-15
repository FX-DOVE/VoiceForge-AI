"use client";

import { PageTransition } from "@/components/motion/page-transition";

export default function Template({ children }) {
  return <PageTransition>{children}</PageTransition>;
}
