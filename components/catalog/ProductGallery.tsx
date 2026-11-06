"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  const [selectedImageId, setSelectedImageId] = useState<string | null>(galleryImages[0]?.id ?? null);
  const mainImage = galleryImages.find((image) => image.id === selectedImageId) ?? galleryImages[0];

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
      
      {/* Thumbnails (Mobile par horizontal, Desktop par vertical) */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto hide-scrollbar pb-2 lg:pb-0 lg:w-24 shrink-0">
        {galleryImages.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setSelectedImageId(img.id)}
            className={`relative h-20 w-20 lg:h-24 lg:w-full shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
              mainImage?.id === img.id ? "border-black shadow-md" : "border-transparent hover:border-gray-300"
            }`}
            aria-label={`View image ${index + 1} of ${productName}`}
            aria-pressed={mainImage?.id === img.id}
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
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 group">
        {mainImage ? <Image
          src={mainImage.image_url}
          alt={productName}
          fill
          priority
          className="object-contain transition-transform duration-500 ease-in-out group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 50vw"
        /> : <div className="absolute inset-0 grid place-items-center text-sm text-gray-500">No image available</div>}
      </div>
      
      {/* Optional: CSS hide-scrollbar inline for clean UI */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
