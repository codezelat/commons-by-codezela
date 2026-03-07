"use client";

import { usePubTheme } from "@/components/site/pub-theme-provider";

export function PubThemeToggle() {
  const { theme, toggle } = usePubTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "lavender" ? "cream" : "lavender"} theme`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--pub-border)] text-[var(--pub-text-secondary)] transition-all hover:bg-[var(--pub-accent-subtle)] hover:text-[var(--pub-accent-text)] hover:scale-110 active:scale-95"
    >
      {theme === "lavender" ? (
        /* Lavender flower — current theme indicator */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Three petals of a lavender bloom */}
          <ellipse cx="12" cy="7" rx="3" ry="5" />
          <ellipse
            cx="7.5"
            cy="13"
            rx="3"
            ry="5"
            transform="rotate(-40 7.5 13)"
          />
          <ellipse
            cx="16.5"
            cy="13"
            rx="3"
            ry="5"
            transform="rotate(40 16.5 13)"
          />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <path d="M12 17v5" />
        </svg>
      ) : (
        /* Honey drop — current theme indicator */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Honey/nectar drop shape */}
          <path d="M12 2C12 2 6 9 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12Z" />
          <path d="M10 14.5a2 2 0 0 0 2 2" opacity="0.6" />
        </svg>
      )}
    </button>
  );
}
