"use client";

import Link from "next/link";

// Shown instead of a blank screen if anything on the page crashes.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-4 text-center focus:outline-none"
    >
      <p className="text-2xl font-extrabold italic text-ink-strong">FashionHub</p>
      <h1 role="alert" className="mt-4 text-xl font-semibold text-ink">
        Something went wrong
      </h1>
      <p className="text-muted">The page hit an unexpected error. Your cart and shortlist are safe on this device.</p>
      <div className="mt-4 flex gap-3">
        <button onClick={reset} className="btn-primary px-6">
          Try again
        </button>
        <Link href="/" className="btn-secondary grid place-items-center px-6">
          Back to the store
        </Link>
      </div>
    </main>
  );
}
