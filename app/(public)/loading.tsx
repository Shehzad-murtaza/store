export default function PublicLoading() {
  return <main className="mx-auto min-h-[65vh] max-w-[1280px] animate-pulse px-4 py-12 sm:px-6 sm:py-16 lg:px-8" aria-label="Loading catalogue">
    <div className="mb-9 space-y-3"><div className="h-3 w-28 rounded bg-[#eaeaea]" /><div className="h-9 w-64 max-w-full rounded bg-[#eaeaea]" /><div className="h-4 w-80 max-w-full rounded bg-[#f0f0f0]" /></div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-xl border border-[#eaeaea] bg-white p-3 shadow-sm"><div className="aspect-[4/3] rounded-lg bg-[#f0f0ef]" /><div className="mt-4 h-4 w-2/3 rounded bg-[#eaeaea]" /><div className="mt-3 h-3 w-1/3 rounded bg-[#f0f0f0]" /></div>)}
    </div>
  </main>;
}
