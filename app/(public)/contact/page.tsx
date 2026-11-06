import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/layout/ContactForm";
import { SELLER_PHONE_DISPLAY, SELLER_WHATSAPP } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact SHEZY with a question about the collection, an order, or anything else. We’re happy to help.",
};

const whatsappLink = `https://wa.me/${SELLER_WHATSAPP}?text=${encodeURIComponent("Hello SHEZY, I would like to get in touch.")}`;

export default function ContactPage() {
  return <main className="mx-auto min-h-[65vh] max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <header className="mb-9 max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">We’re here to help</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Get in touch</h1>
      <p className="mt-3 text-sm leading-6 text-[#666]">Questions about a piece or just want to say hello? Send us a note and we’ll get back to you.</p>
    </header>

    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)] lg:gap-12">
      <section className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-7" aria-label="Contact form">
        <h2 className="mb-5 text-base font-semibold">Send us a message</h2>
        <ContactForm />
      </section>
      <aside className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#777]">Prefer a quick chat?</p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">We’re one message away.</h2>
        <p className="mt-2 text-sm leading-6 text-[#666]">Reach us on WhatsApp or give us a call. We’re happy to help with product questions and more.</p>
        <Link href={whatsappLink} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#333] hover:shadow-md"><MessageCircle size={16} />Chat on WhatsApp <ArrowUpRight size={14} /></Link>
        <a href={`tel:+${SELLER_WHATSAPP}`} className="mt-4 flex items-center gap-3 rounded-lg border border-[#eaeaea] px-4 py-3 text-sm text-[#444] transition hover:bg-[#fafafa] hover:text-black"><Phone size={16} className="text-[#777]" /><span><span className="block text-[10px] uppercase tracking-[0.1em] text-[#888]">Call us</span><span className="mt-0.5 block font-medium">{SELLER_PHONE_DISPLAY}</span></span></a>
      </aside>
    </div>
  </main>;
}
