"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
// Agar aapne apna cart context/provider banaya hua hai toh use yahan import karein
// import { useCart } from "@/components/cart/CartProvider";

// Temporary mock data UI check karne ke liye. (Aap isey apne useCart hook se replace kar lenge)
const mockCartItems = [
  { id: "1", name: "Premium Leather Jacket", price: 120.00, quantity: 1, image_url: "/placeholder.png", slug: "premium-leather-jacket" },
  { id: "2", name: "Classic White Sneakers", price: 85.50, quantity: 2, image_url: "/placeholder.png", slug: "classic-white-sneakers" }
];

export default function CartView() {
  // const { cartItems, updateQuantity, removeItem, cartTotal } = useCart();
  const cartItems = mockCartItems; // Replace with actual context
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const shippingFee = cartTotal > 0 ? 15.00 : 0; // Schema mein defined logic ke mutabiq
  const finalTotal = cartTotal + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven&apos;t added anything to your cart yet. Explore our top categories to find something you love.</p>
        <Link 
          href="/products" 
          className="bg-black text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {cartItems.map((item) => (
              <div key={item.id} className="py-6 sm:py-8 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center sm:items-start group">
                
                {/* Product Info */}
                <div className="col-span-6 flex gap-4 w-full">
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <Link href={`/products/${item.slug}`} className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-2 hover:text-gray-600 transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-gray-500 font-medium mt-1">${item.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="col-span-3 flex sm:justify-center items-center w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm p-1">
                    <button 
                      // onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-900">{item.quantity}</span>
                    <button 
                      // onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="col-span-3 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                  <span className="font-black text-gray-900 text-lg">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button 
                    // onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2 sm:mt-2"
                    title="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Order Summary (Sticky Sidebar) */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm sm:text-base text-gray-600 mb-6 border-b border-gray-200 pb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Estimate</span>
                <span className="font-semibold text-gray-900">${shippingFee.toFixed(2)}</span>
              </div>
              {/* Optional: Add Tax or Discount rows here later */}
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-black">${finalTotal.toFixed(2)}</span>
            </div>
            
            <Link 
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-base font-semibold text-white shadow-xl hover:bg-gray-800 transition-all hover:gap-4 group"
            >
              Proceed to Checkout
              <ArrowRight className="h-5 w-5 transition-all" />
            </Link>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>Secure checkout powered by</span>
              <span className="font-bold text-gray-700 tracking-tight">SHEZY</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}