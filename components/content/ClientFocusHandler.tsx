"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * ClientFocusHandler
 * Moves focus to the main heading (h1) on route change for screen reader users
 * This provides context when navigating between pages
 */
export default function ClientFocusHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      // Try to find and focus the main h1
      const h1 = document.querySelector("main h1");
      if (h1) {
        (h1 as HTMLElement).setAttribute("tabindex", "-1");
        (h1 as HTMLElement).focus();
      } else {
        // Fallback: focus the main element
        const main = document.querySelector("#main-content");
        (main as HTMLElement)?.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

