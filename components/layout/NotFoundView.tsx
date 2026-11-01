import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function NotFoundView() {
  return <main className="grid min-h-[65vh] place-items-center px-4 py-16">
    <div className="max-w-md text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777]">404 · Page not found</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">This page isn’t here.</h1>
      <p className="mt-3 text-sm leading-6 text-[#666]">The page may have moved, or the address may be incorrect.</p>
      <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#333] hover:shadow-md"><ArrowLeft size={15} />Back to home</Link>
    </div>
  </main>;
}
