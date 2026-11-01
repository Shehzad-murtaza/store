"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import type { ProductImage } from "@/types";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm sm:aspect-[4/3]">
        {activeImage ? <Image src={activeImage.image_url} alt={productName} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-[#999]"><ImageIcon size={28} strokeWidth={1.4} /><span className="text-sm">Product image coming soon</span></div>}
      </div>
      {images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
        {images.map((image, index) => <button key={image.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show product image ${index + 1}`} aria-pressed={activeIndex === index} className={`relative aspect-square overflow-hidden rounded-lg border bg-white ${activeIndex === index ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]" : "border-[#eaeaea] opacity-75 hover:opacity-100"}`}>
          <Image src={image.image_url} alt={`${productName}, image ${index + 1}`} fill sizes="100px" className="object-cover" />
        </button>)}
      </div>}
    </div>
  );
}
