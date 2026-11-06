"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images = [], productName }: ProductGalleryProps) {
  const galleryImages = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const mainImage = galleryImages[selectedIndex] ?? galleryImages[0];

  function moveImage(direction: -1 | 1) {
    if (galleryImages.length < 2) return;
    setSelectedIndex((current) => (current + direction + galleryImages.length) % galleryImages.length);
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
      
      {/* Thumbnails (Mobile par horizontal, Desktop par vertical) */}
      <div className="product-gallery-thumbnails flex gap-3 overflow-x-auto pb-2 lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
        {galleryImages.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={`relative h-20 w-20 lg:h-24 lg:w-full shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
              selectedIndex === index ? "border-black shadow-sm" : "border-transparent hover:border-gray-300"
            }`}
            aria-label={`View image ${index + 1} of ${productName}`}
            aria-pressed={selectedIndex === index}
          >
            <Image
              src={img.image_url}
              alt={`${productName} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="96px"
            />
          </button>
        ))}
      </div>

      {/* Main Image View */}
      <div
        className="group relative aspect-square w-full flex-1 touch-pan-y overflow-hidden rounded-2xl border border-gray-100 bg-gray-50"
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const endX = event.changedTouches[0]?.clientX;
          if (endX !== undefined) {
            const delta = endX - touchStartX.current;
            if (Math.abs(delta) > 45) moveImage(delta < 0 ? 1 : -1);
          }
          touchStartX.current = null;
        }}
      >
        {mainImage ? <Image
          src={mainImage.image_url}
          alt={productName}
          fill
          priority
          className="object-contain transition-opacity duration-200"
          sizes="(max-width: 768px) 100vw, 50vw"
        /> : <div className="absolute inset-0 grid place-items-center text-sm text-gray-500">No image available</div>}
        {galleryImages.length > 1 && <>
          <button type="button" onClick={() => moveImage(-1)} aria-label="Previous product image" className="gallery-nav-button absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border shadow-sm"><ChevronLeft size={19} /></button>
          <button type="button" onClick={() => moveImage(1)} aria-label="Next product image" className="gallery-nav-button absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border shadow-sm"><ChevronRight size={19} /></button>
          <span className="gallery-count-pill absolute bottom-3 right-3 rounded-full border px-2.5 py-1 text-[11px] tabular-nums">{selectedIndex + 1} / {galleryImages.length}</span>
        </>}
      </div>
    </div>
  );
}
