"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import type { ProductImage } from "@/types";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const activeImage = images[activeIndex];
  const hasMultipleImages = images.length > 1;

  function moveImage(direction: -1 | 1) {
    if (!hasMultipleImages) return;
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <div className="min-w-0">
      <div
        role="group"
        aria-label="Product image gallery"
        aria-roledescription="carousel"
        tabIndex={hasMultipleImages ? 0 : undefined}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") moveImage(-1);
          if (event.key === "ArrowRight") moveImage(1);
        }}
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const distance = event.changedTouches[0]?.clientX - touchStartX.current;
          if (distance && Math.abs(distance) > 40) moveImage(distance > 0 ? -1 : 1);
          touchStartX.current = null;
        }}
        className="product-gallery-stage relative aspect-square overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm focus-visible:outline-none sm:aspect-[4/3]"
      >
        {activeImage ? <Image src={activeImage.image_url} alt={`${productName}, image ${activeIndex + 1} of ${images.length}`} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-[#999]"><ImageIcon size={28} strokeWidth={1.4} /><span className="text-sm">Product image coming soon</span></div>}

        {hasMultipleImages && <>
          <button type="button" onClick={() => moveImage(-1)} aria-label="Previous image" className="gallery-nav-button absolute left-3 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => moveImage(1)} aria-label="Next image" className="gallery-nav-button absolute right-3 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <span className="gallery-count-pill absolute right-3 top-3 z-10 rounded-full border px-2.5 py-1 text-[11px] font-medium tabular-nums">
            {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
          <span className="sr-only" aria-live="polite">Image {activeIndex + 1} of {images.length}</span>
        </>}
      </div>

      {hasMultipleImages && <div className="product-gallery-thumbnails mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Choose product image">
        {images.map((image, index) => <button key={image.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show product image ${index + 1}`} aria-pressed={activeIndex === index} className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border bg-white transition-opacity sm:w-20 ${activeIndex === index ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]" : "border-[#eaeaea] opacity-70 hover:opacity-100"}`}>
          <Image src={image.image_url} alt="" fill sizes="80px" className="object-cover" />
        </button>)}
      </div>}
    </div>
  );
}
