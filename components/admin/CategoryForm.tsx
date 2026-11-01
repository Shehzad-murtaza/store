"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { slugify } from "@/lib/catalog/slug";
import { createClient } from "@/lib/supabase/client";
import { removeCategoryImage, saveCategory, setCategoryImage } from "@/app/admin/actions";
import type { Category } from "@/types";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [recordId, setRecordId] = useState(category?.id ?? "");
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(category?.image_url ?? null);
  const [busy, setBusy] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleImageChange(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      showToast("Choose a JPG, PNG, WebP, or AVIF image.", "error");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      showToast("The category image must be 10 MB or smaller.", "error");
      return;
    }
    setImageFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    formData.set("id", recordId);
    formData.set("name", name);
    formData.set("slug", slug);

    try {
      const result = await saveCategory(formData);
      if (!result.ok || !result.id) {
        showToast(result.error ?? "The category could not be saved.", "error");
        return;
      }
      setRecordId(result.id);

      if (imageFile) {
        const extension = imageFile.type.split("/")[1].replace("jpeg", "jpg");
        const path = `categories/${result.id}/${crypto.randomUUID()}.${extension}`;
        const supabase = createClient();
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, imageFile, { contentType: imageFile.type, upsert: false });
        if (uploadError) {
          showToast(`Category saved, but the image upload failed: ${uploadError.message}`, "warning");
          return;
        }
        const imageResult = await setCategoryImage(result.id, path);
        if (!imageResult.ok) {
          await supabase.storage.from("product-images").remove([path]);
          showToast(imageResult.error ?? "Category saved, but the image could not be attached.", "warning");
          return;
        }
        setImageUrl(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
        if (imageResult.warning) {
          showToast(imageResult.warning, "warning");
          return;
        }
      }

      showToast(category ? "Category updated." : "Category created.");
      router.push("/admin/categories");
      router.refresh();
    } catch {
      showToast("The category could not be saved. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={handleSubmit} className="space-y-6">
    <input type="hidden" name="id" value={recordId} />
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="admin-field"><span>Category name <b>*</b></span><Input name="name" required maxLength={120} value={name} onChange={(event) => handleNameChange(event.target.value)} placeholder="For example, Home & living" className="admin-input" /></label>
      <label className="admin-field"><span>Slug <b>*</b></span><Input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }} placeholder="home-living" className="admin-input" /><small>Used in the category page URL.</small></label>
    </div>
    <label className="admin-field"><span>Description</span><textarea name="description" rows={5} maxLength={2000} defaultValue={category?.description ?? ""} placeholder="A short introduction to this collection" className="admin-textarea" /></label>
    <div className="admin-field">
      <span>Category image <small>(optional)</small></span>
      {imageUrl && <div className="mb-2 flex flex-wrap items-start gap-3"><div className="relative aspect-[4/1] w-full max-w-md overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f4f4f4]"><Image src={imageUrl} alt={category?.name ?? name} fill sizes="448px" className="object-cover" /></div>{recordId && <ConfirmDialog title="Remove the category image?" description="The image will no longer appear on the storefront and its stored file will be deleted." compact onConfirm={() => removeCategoryImage(recordId)} onSuccess={() => setImageUrl(null)} />}</div>}
      <label className="admin-upload w-fit"><Upload size={16} /><span>{imageFile ? imageFile.name : imageUrl ? "Replace image" : "Choose an image"}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => handleImageChange(event.target.files?.[0])} /></label>
      <small>JPG, PNG, WebP, or AVIF. Maximum 10 MB.</small>
    </div>
    <div className="flex flex-wrap gap-3 border-t border-[#eaeaea] pt-5"><Button type="submit" disabled={busy} className="min-w-36">{busy && <LoaderCircle size={15} className="animate-spin" />}{busy ? "Saving…" : category ? "Save changes" : "Create category"}</Button><Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>Cancel</Button></div>
  </form>;
}
