"use client";

import { usePathname } from "next/navigation";

export function useDashboardNavEnabled() {
  const pathname = usePathname();

  const isOnCourseSelection =
    pathname === "/courses" ||
    pathname.startsWith("/buttons");

  const navEnabled = !isOnCourseSelection;

  return { navEnabled };
}
