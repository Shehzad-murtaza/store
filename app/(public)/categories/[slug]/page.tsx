import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductGridSkeleton, ProductResults } from "@/components/catalog/ProductResults";
import { ResponsiveProductFilters } from "@/components/catalog/ResponsiveProductFilters";
import { PublicBackButton } from "@/components/layout/PublicBackButton";
import { parseCatalogFilters, type CatalogSearchParams } from "@/lib/catalog/filters";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getCategoryBySlug } from "@/lib/supabase/catalog";

type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearchParams> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } };

  const description = category.description?.replace(/\s+/g, " ").trim().slice(0, 160) || `Browse ${category.name} at ${SITE_NAME}.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      type: "website",
      title: category.name,
      description,
      url: `/categories/${category.slug}`,
      images: category.image_url ? [{ url: category.image_url, alt: category.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description,
      images: category.image_url ? [category.image_url] : undefined,
    },
  };
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const filters = parseCatalogFilters(search);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Categories", item: `${SITE_URL}/categories` },
      { "@type": "ListItem", position: 2, name: category.name, item: `${SITE_URL}/categories/${category.slug}` },
    ],
  };

  return <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-7 sm:px-6 sm:py-11 lg:px-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <div className="mb-5 sm:mb-6"><PublicBackButton fallbackHref="/categories" /></div>
    <header className="mb-5 max-w-3xl sm:mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Category</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{category.name}</h1>
      {category.description && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#666]">{category.description}</p>}
    </header>
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      <ResponsiveProductFilters categories={[]} filters={filters} action={`/categories/${category.slug}`} showCategory={false} />
      <div className="min-w-0 w-full"><Suspense fallback={<ProductGridSkeleton />}><ProductResults filters={filters} categoryId={category.id} clearHref={`/categories/${category.slug}`} includeCategory={false} /></Suspense></div>
    </div>
  </main>;
}
