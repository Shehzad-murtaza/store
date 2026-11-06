"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images = [], productName }: ProductGalleryProps) {
  // Agar images array empty ho toh ek placeholder set kar dein
  const galleryImages = images.length > 0 ? images : ["/placeholder.png"];
  const [mainImage, setMainImage] = useState(galleryImages[0]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
      
      {/* Thumbnails (Mobile par horizontal, Desktop par vertical) */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto hide-scrollbar pb-2 lg:pb-0 lg:w-24 shrink-0">
        {galleryImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={`relative h-20 w-20 lg:h-24 lg:w-full shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
              mainImage === img ? "border-black shadow-md" : "border-transparent hover:border-gray-300"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="96px"
            />
          </button>
        ))}
      </div>

      {/* Main Image View */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 group">
        <Image
          src={mainImage}
          alt={productName}
          fill
          priority
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Optional: 'Sale' ya 'Featured' Badge over main image */}
        <div className="absolute top-4 left-4">
           <span className="rounded-full bg-black/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            Top Seller
          </span>
        </div>
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