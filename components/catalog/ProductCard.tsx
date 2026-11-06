import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye } from "lucide-react";

// Note: Agar aapka Product type different hai, toh yahan adjust kar lein.
interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  slug: string;
  category?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col bg-white rounded-2xl p-3 transition-all duration-300 hover:shadow-xl border border-gray-100">
      
      {/* Image Container with Hover Zoom Effect */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-50 mb-4">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.image_url || "/placeholder.png"}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Quick Actions (Hover par desktop me upar aayenge) */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 p-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4">
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-black hover:text-white transition-colors"
            title="Add to Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <Link 
            href={`/products/${product.slug}`} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-black hover:text-white transition-colors"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </Link>
        </div>
        
        {/* Optional: 'New' ya 'Sale' Badge */}
        <span className="absolute top-3 left-3 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          New
        </span>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 px-1">
        {product.category && (
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            {product.category}
          </span>
        )}
        
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <div className="mt-3 flex items-center justify-between">
          <p className="text-base sm:text-lg font-black text-black">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}