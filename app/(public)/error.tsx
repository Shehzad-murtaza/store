"use client";

import { Button } from "@/components/ui/button";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto grid min-h-[60vh] max-w-[1280px] place-items-center px-4 py-16 sm:px-6 lg:px-8">
    <div className="max-w-md text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">A moment, please</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">We could not load the collection.</h1>
      <p className="mt-3 text-sm leading-6 text-[#666]">Please try again. The catalogue will be here when the connection is back.</p>
      <Button type="button" onClick={reset} className="mt-6">Try again</Button>
    </div>
  </main>;
}
