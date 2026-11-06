import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/catalog/ProductCard";
import ProductGallery from "@/components/catalog/ProductGallery";
import { ProductDescription } from "@/components/catalog/ProductDescription";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { WhatsAppButton } from "@/components/catalog/WhatsAppButton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { RatingStars } from "@/components/reviews/RatingStars";
import { PublicBackButton } from "@/components/layout/PublicBackButton";
import { formatPKR } from "@/lib/catalog/format";
import { isOutOfStock } from "@/lib/catalog/orders";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getProductBySlug, getProducts } from "@/lib/supabase/catalog";
import { getProductReviews } from "@/lib/supabase/reviews";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };

  const price = product.discount_price ?? product.price;
  const description = product.description?.replace(/\s+/g, " ").trim().slice(0, 160) || `${product.name} — available at ${SITE_NAME} for ${formatPKR(price)}.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      images: product.primary_image_url ? [{ url: product.primary_image_url, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.primary_image_url ? [product.primary_image_url] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.category_id && product.category
    ? await getProducts({ categoryId: product.category_id, excludeId: product.id, limit: 4, sort: "newest" })
    : [];
  const reviews = await getProductReviews(product.id);
  const hasDiscount = product.discount_price !== null;
  const currentPrice = hasDiscount ? product.discount_price! : product.price;
  const outOfStock = isOutOfStock(product);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(product.description ? { description: product.description } : {}),
    ...(product.category ? { category: product.category.name } : {}),
    ...(product.product_images.length ? { image: product.product_images.map((image) => image.image_url) } : {}),
    ...(product.rating_count > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(product.rating_average), reviewCount: product.rating_count } } : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      price: Number(currentPrice),
      priceCurrency: "PKR",
      itemCondition: "https://schema.org/NewCondition",
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Products", item: `${SITE_URL}/products` },
      ...(product.category ? [{ "@type": "ListItem", position: 2, name: product.category.name, item: `${SITE_URL}/categories/${product.category.slug}` }] : []),
      { "@type": "ListItem", position: product.category ? 3 : 2, name: product.name, item: `${SITE_URL}/products/${product.slug}` },
    ],
  };

  return <main className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

    <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 sm:mb-6">
      <PublicBackButton fallbackHref="/products" />
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#777] sm:text-xs">
        <Link href="/products" className="hover:text-[#111]">Products</Link><span aria-hidden="true">/</span>
      {product.category && <><Link href={`/categories/${product.category.slug}`} className="hover:text-[#111]">{product.category.name}</Link><span aria-hidden="true">/</span></>}
        <span className="max-w-full truncate text-[#444]">{product.name}</span>
      </nav>
    </div>

    <div className="grid min-w-0 gap-5 sm:gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
      <ProductGallery key={product.slug} images={product.product_images} productName={product.name} />
      <section className="min-w-0 lg:py-2">
        {product.category && <Link href={`/categories/${product.category.slug}`} className="text-xs font-medium uppercase tracking-[0.13em] text-[#777] hover:text-[#111]">{product.category.name}</Link>}
        <h1 className="mt-2 break-words text-[25px] font-semibold leading-tight tracking-[-0.04em] sm:mt-3 sm:text-3xl">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mt-4">
          <span className="text-xl font-semibold">{formatPKR(currentPrice)}</span>
          {hasDiscount && <span className="text-sm text-[#888] line-through">{formatPKR(product.price)}</span>}
        </div>
        {product.rating_count > 0 && <a href="#reviews-heading" className="mt-2 inline-flex items-center gap-2 text-xs text-[#666] hover:text-[#111]">
          <RatingStars value={product.rating_average} size={14} />
          <span>{Number(product.rating_average).toFixed(1)} · {product.rating_count} {product.rating_count === 1 ? "review" : "reviews"}</span>
        </a>}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${outOfStock ? "bg-[#f1f1f1] text-[#666]" : "bg-[#f0f4ef] text-[#45614a]"}`}>{outOfStock ? "Sold out" : "In stock"}</span>
          {!outOfStock && product.stock_quantity <= 5 && <span className="text-xs font-medium text-[#8a6b28]">Only {product.stock_quantity} left</span>}
        </div>
        <div className="mt-6 w-full space-y-3 sm:mt-8 lg:max-w-md">
          <div className="flex gap-3">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                discountPrice: product.discount_price,
                imageUrl: product.primary_image_url,
                stock: product.stock_quantity,
                sold: product.is_sold,
              }}
              className="flex-1 py-3.5 text-sm"
            />
            <WishlistButton
              className="wishlist-detail-btn"
              size={18}
              item={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                discountPrice: product.discount_price,
                imageUrl: product.primary_image_url,
                stock: product.stock_quantity,
                sold: product.is_sold,
              }}
            />
          </div>
          <WhatsAppButton name={product.name} price={Number(currentPrice)} slug={product.slug} />
        </div>
      </section>
    </div>

    {product.description && <section aria-labelledby="product-description-heading" className="mt-8 border-t border-[#eaeaea] pt-6 sm:mt-10 sm:pt-8">
      <div className="max-w-3xl">
        <h2 id="product-description-heading" className="text-base font-semibold tracking-[-0.02em] sm:text-lg">Description</h2>
          <ProductDescription description={product.description} />
      </div>
    </section>}

    <ProductReviews productId={product.id} productName={product.name} ratingAverage={Number(product.rating_average)} ratingCount={product.rating_count} reviews={reviews} />

    {related.length > 0 && <section className="mt-12 border-t border-[#eaeaea] pt-8 sm:mt-16 sm:pt-10">
      <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Keep exploring</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Related products</h2></div>{product.category && <Link href={`/categories/${product.category.slug}`} className="text-sm text-[#555] hover:text-black">View category</Link>}</div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
    </section>}
  </main>;
}
