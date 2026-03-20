"use client";

import Link from "next/link";
import { TrainingProgressBadge } from "@/components/layout/TrainingProgressBadge";

export function HeaderNav() {
  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <TrainingProgressBadge />
      <nav aria-label="Main navigation">
        <ul className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/#training-modules" className="hover:text-primary transition-colors">
              Training
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>
          </li>
          <li>
            <Link href="/assistant" className="hover:text-primary transition-colors font-medium">
              AT assistant
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
