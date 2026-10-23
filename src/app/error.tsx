"use client";

import Link from "next/link";

// Shown instead of a blank screen if anything on the page crashes.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-2xl font-extrabold italic text-[#0d3356]">FashionHub</p>
      <h1 role="alert" className="mt-4 text-xl font-semibold text-[#1d364d]">
        Something went wrong
      </h1>
      <p className="text-[#667085]">The page hit an unexpected error. Your cart and shortlist are safe on this device.</p>
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
