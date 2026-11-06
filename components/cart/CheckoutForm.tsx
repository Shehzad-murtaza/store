"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CreditCard, Banknote, ShieldCheck } from "lucide-react";
// import { useCart } from "@/components/cart/CartProvider";

// Temporary mock data UI check karne ke liye. (Isy apne context/state se replace kar lena)
const mockCartItems = [
  { id: "1", name: "Premium Leather Jacket", price: 120.00, quantity: 1, image_url: "/placeholder.png" }
];

export default function CheckoutForm() {
  // const { cartItems, cartTotal } = useCart();
  const cartItems = mockCartItems;
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = 15.00; 
  const finalTotal = cartTotal + shippingFee;

  const [paymentMethod, setPaymentMethod] = useState("cod");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Checkout Form */}
        <div className="flex-1">
          <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Checkout</h1>
          
          <form className="space-y-8">
            {/* 1. Contact Info */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm">1</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="John Doe" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="+1 234 567 8900" required />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm">2</span>
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Complete Address *</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none" placeholder="House/Apt No, Street Name, Area..." required></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">City *</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="e.g. New York" required />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm">3</span>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* COD Option */}
                <label className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-all ${paymentMethod === 'cod' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment_method" value="cod" className="sr-only" onChange={(e) => setPaymentMethod(e.target.value)} checked={paymentMethod === 'cod'} />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                        <Banknote className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="flex flex-col">
                        <span className="block text-sm font-bold text-gray-900">Cash on Delivery</span>
                        <span className="block text-xs text-gray-500">Pay when you receive</span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Bank Transfer Option */}
                <label className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-all ${paymentMethod === 'bank' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment_method" value="bank" className="sr-only" onChange={(e) => setPaymentMethod(e.target.value)} checked={paymentMethod === 'bank'} />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                        <CreditCard className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="flex flex-col">
                        <span className="block text-sm font-bold text-gray-900">Bank Transfer</span>
                        <span className="block text-xs text-gray-500">Direct account transfer</span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary (Sticky) */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">In Your Cart</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-[10px] text-white font-bold border-2 border-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm text-gray-600 border-t border-gray-200 pt-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">${shippingFee.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center my-6 border-t border-gray-200 pt-6">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-black">${finalTotal.toFixed(2)}</span>
            </div>
            
            <button className="w-full rounded-xl bg-black px-6 py-4 text-base font-bold text-white shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Place Order
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              By placing your order, you agree to our Terms and Conditions.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}