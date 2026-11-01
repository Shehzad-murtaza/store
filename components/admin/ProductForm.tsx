"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { addProductImages, deleteProductImage, saveProduct } from "@/app/admin/actions";
import { slugify } from "@/lib/catalog/slug";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product, ProductImage } from "@/types";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

interface PendingUpload {
  key: string;
  file: File;
  previewUrl: string;
}

export function ProductForm({ product, categories, images: initialImages = [] }: { product?: Product; categories: Category[]; images?: ProductImage[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const previews = useRef<string[]>([]);
  const [recordId, setRecordId] = useState(product?.id ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [currentImages, setCurrentImages] = useState(initialImages);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [primarySelection, setPrimarySelection] = useState(() => {
    const primary = initialImages.find((image) => image.is_primary) ?? initialImages[0];
    return primary ? `existing:${primary.id}` : "";
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleImageFiles(files: FileList | null) {
    if (!files?.length) return;
    const chosen = Array.from(files);
    if (chosen.length > 10) {
      showToast("Choose up to 10 images at a time.", "error");
      return;
    }
    const invalidType = chosen.find((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      showToast("Use JPG, PNG, WebP, or AVIF images.", "error");
      return;
    }
    const tooLarge = chosen.find((file) => file.size > MAX_IMAGE_SIZE);
    if (tooLarge) {
      showToast("Each image must be 10 MB or smaller.", "error");
      return;
    }

    previews.current.forEach((url) => URL.revokeObjectURL(url));
    const nextUploads = chosen.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previews.current.push(previewUrl);
      return { file, previewUrl, key: crypto.randomUUID() };
    });
    setPendingUploads(nextUploads);
    if (!primarySelection || primarySelection.startsWith("new:")) setPrimarySelection("new:0");
  }

  function removePendingUpload(index: number) {
    const nextUploads = pendingUploads.filter((_, itemIndex) => itemIndex !== index);
    const removed = pendingUploads[index];
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    previews.current = previews.current.filter((url) => url !== removed?.previewUrl);
    setPendingUploads(nextUploads);

    if (primarySelection === `new:${index}`) {
      const fallback = currentImages.find((image) => image.is_primary) ?? currentImages[0];
      setPrimarySelection(fallback ? `existing:${fallback.id}` : nextUploads.length ? "new:0" : "");
    } else if (primarySelection.startsWith("new:")) {
      const currentIndex = Number(primarySelection.slice(4));
      if (currentIndex > index) setPrimarySelection(`new:${currentIndex - 1}`);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current || busy) return;
    setBusy(true);
    const formData = new FormData(formRef.current);
    formData.set("id", recordId);
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("primarySelection", primarySelection);

    try {
      const result = await saveProduct(formData);
      if (!result.ok || !result.id) {
        showToast(result.error ?? "The product could not be saved.", "error");
        return;
      }
      setRecordId(result.id);

      if (pendingUploads.length) {
        const supabase = createClient();
        const uploadedPaths: string[] = [];
        for (const pending of pendingUploads) {
          const extension = EXTENSIONS[pending.file.type];
          const path = `${result.id}/${crypto.randomUUID()}.${extension}`;
          const { error } = await supabase.storage.from("product-images").upload(path, pending.file, { contentType: pending.file.type, upsert: false });
          if (error) {
            if (uploadedPaths.length) await supabase.storage.from("product-images").remove(uploadedPaths);
            showToast(`Product saved, but an image upload failed: ${error.message}`, "warning");
            router.replace(`/admin/products/${result.id}/edit`);
            return;
          }
          uploadedPaths.push(path);
        }

        const primaryIndex = primarySelection.startsWith("new:") ? Number(primarySelection.slice(4)) : -1;
        const imageResult = await addProductImages(result.id, uploadedPaths, primaryIndex);
        if (!imageResult.ok) {
          await supabase.storage.from("product-images").remove(uploadedPaths);
          showToast(`Product saved, but its images were not attached: ${imageResult.error ?? "Please try again."}`, "warning");
          router.replace(`/admin/products/${result.id}/edit`);
          return;
        }
      }

      showToast(product ? "Product updated." : "Product created.");
      router.push("/admin/products");
      router.refresh();
    } catch {
      showToast("The product could not be saved. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return <form ref={formRef} onSubmit={handleSubmit} className="space-y-7">
    <input type="hidden" name="id" value={recordId} />
    <div className="admin-form-section">
      <h2>Product details</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="admin-field"><span>Product name <b>*</b></span><Input name="name" required maxLength={180} value={name} onChange={(event) => handleNameChange(event.target.value)} placeholder="Product name" className="admin-input" /></label>
        <label className="admin-field"><span>Slug <b>*</b></span><Input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }} placeholder="product-name" className="admin-input" /><small>Used in the product page URL.</small></label>
        <label className="admin-field"><span>Category</span><select name="category_id" defaultValue={product?.category_id ?? ""} className="admin-select"><option value="">Uncategorized</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="admin-field"><span>Price (PKR) <b>*</b></span><Input name="price" type="number" min="0" step="0.01" required defaultValue={product?.price ?? ""} placeholder="0.00" className="admin-input" /></label>
          <label className="admin-field"><span>Discount (PKR)</span><Input name="discount_price" type="number" min="0" step="0.01" defaultValue={product?.discount_price ?? ""} placeholder="Optional" className="admin-input" /></label>
        </div>
        <label className="admin-field sm:col-span-2"><span>Description</span><textarea name="description" rows={5} maxLength={5000} defaultValue={product?.description ?? ""} placeholder="Tell customers about this product" className="admin-textarea" /></label>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-7 gap-y-4">
        <label className="admin-toggle"><input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} /><span className="admin-toggle-track"><span /></span><span className="inline-flex items-center gap-1.5"><Star size={14} />Featured</span></label>
        <label className="admin-toggle"><input type="checkbox" name="is_sold" defaultChecked={product?.is_sold ?? false} /><span className="admin-toggle-track"><span /></span><span>Mark as sold</span></label>
      </div>
    </div>

    <div className="admin-form-section">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2>Product images</h2><p className="mt-1 text-xs leading-5 text-[#777]">Upload up to 10 images at once. Choose one image to show first.</p></div>
        <label className="admin-upload"><ImagePlus size={16} /><span>Add images</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => handleImageFiles(event.target.files)} /></label>
      </div>
      {(currentImages.length > 0 || pendingUploads.length > 0) ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {currentImages.map((image) => <div key={image.id} className={`overflow-hidden rounded-xl border bg-white ${primarySelection === `existing:${image.id}` ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]" : "border-[#eaeaea]"}`}>
          <div className="relative aspect-square bg-[#f2f2f0]"><Image src={image.image_url} alt="Product image" fill sizes="220px" className="object-cover" /><button type="button" onClick={() => setPrimarySelection(`existing:${image.id}`)} aria-label="Set this image as primary" aria-pressed={primarySelection === `existing:${image.id}`} className="absolute left-2 top-2 flex size-8 items-center justify-center rounded-full bg-white text-[#333] shadow-sm">{primarySelection === `existing:${image.id}` ? <Check size={15} /> : <span className="size-3 rounded-full border border-[#aaa]" />}</button></div>
          <div className="flex items-center justify-between gap-2 p-2"><span className="truncate text-[10px] text-[#666]">{primarySelection === `existing:${image.id}` ? "Primary image" : "Product image"}</span><ConfirmDialog title="Delete this image?" description="This removes the image from the product and storage." compact onConfirm={() => deleteProductImage(image.id)} onSuccess={() => { setCurrentImages((items) => items.filter((item) => item.id !== image.id)); if (primarySelection === `existing:${image.id}`) { const next = currentImages.find((item) => item.id !== image.id); setPrimarySelection(next ? `existing:${next.id}` : pendingUploads.length ? "new:0" : ""); } }} /></div>
        </div>)}
        {pendingUploads.map((upload, index) => <div key={upload.key} className={`overflow-hidden rounded-xl border bg-white ${primarySelection === `new:${index}` ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]" : "border-[#eaeaea]"}`}>
          <div className="relative aspect-square bg-[#f2f2f0]" style={{ backgroundImage: `url("${upload.previewUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }}><button type="button" onClick={() => setPrimarySelection(`new:${index}`)} aria-label="Set this upload as primary" aria-pressed={primarySelection === `new:${index}`} className="absolute left-2 top-2 flex size-8 items-center justify-center rounded-full bg-white text-[#333] shadow-sm">{primarySelection === `new:${index}` ? <Check size={15} /> : <span className="size-3 rounded-full border border-[#aaa]" />}</button><button type="button" onClick={() => removePendingUpload(index)} aria-label="Remove selected upload" className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white text-[#7c3732] shadow-sm"><Trash2 size={15} /></button></div>
          <div className="truncate p-2 text-[10px] text-[#666]">{primarySelection === `new:${index}` ? "Primary image · " : ""}{upload.file.name}</div>
        </div>)}
      </div> : <div className="mt-5 rounded-xl border border-dashed border-[#dedede] bg-[#fafafa] px-4 py-10 text-center text-sm text-[#777]">No images added yet.</div>}
    </div>

    <div className="flex flex-wrap gap-3 border-t border-[#eaeaea] pt-5"><Button type="submit" disabled={busy} className="min-w-36">{busy && <LoaderCircle size={15} className="animate-spin" />}{busy ? "Saving…" : product ? "Save changes" : "Create product"}</Button><Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>Cancel</Button><Link href="/admin/products" className="self-center text-sm text-[#777] hover:text-black">Back to products</Link></div>
  </form>;
}
