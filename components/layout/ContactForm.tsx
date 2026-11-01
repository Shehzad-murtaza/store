"use client";

import { FormEvent, useState } from "react";
import { Check, LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const form = event.currentTarget;

    // This phase intentionally acknowledges the message locally without sending or storing it.
    window.setTimeout(() => {
      form.reset();
      setSubmitted(true);
      setSubmitting(false);
    }, 250);
  }

  return <div>
    {submitted && <div role="status" aria-live="polite" className="mb-5 flex items-start gap-3 rounded-xl border border-[#dfe9df] bg-[#f4f8f3] p-4 text-sm text-[#38583d]">
      <Check size={17} className="mt-0.5 shrink-0" /><div><p className="font-medium">Thanks for reaching out.</p><p className="mt-1 text-xs leading-5 text-[#55705a]">This form is a front-end demo and does not send messages yet. For a reply, please contact us on WhatsApp.</p></div>
    </div>}
    <form onSubmit={handleSubmit} onChange={() => setSubmitted(false)} className="space-y-5">
      <label className="contact-field"><span>Name</span><Input name="name" autoComplete="name" required maxLength={120} placeholder="Your name" className="contact-input" /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="contact-field"><span>Email</span><Input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" className="contact-input" /></label>
        <label className="contact-field"><span>Phone <small>(optional)</small></span><Input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="Your phone number" className="contact-input" /></label>
      </div>
      <label className="contact-field"><span>Message</span><textarea name="message" required minLength={5} maxLength={3000} rows={6} placeholder="How can we help?" className="contact-textarea" /></label>
      <Button type="submit" disabled={submitting} className="min-w-40 bg-[#1a1a1a] py-3 text-sm hover:bg-[#333]">
        {submitting ? <><LoaderCircle size={15} className="animate-spin" />Sending…</> : <>Send message <Send size={14} /></>}
      </Button>
    </form>
  </div>;
}
