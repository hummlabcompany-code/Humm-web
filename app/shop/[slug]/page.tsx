import type { Metadata } from "next";
import { getShopifyProduct, getShopifyProducts, ShopifyProduct } from "../shopify";
import ProductClient from "./product-client";

const SITE_URL = "https://humm-store.customkeyrambitvn.chatgpt.site";
const fallbackDescription = "Đèn in 3D đầy màu sắc từ humm.";

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const handle = decodeURIComponent(slug);
  const product = await getShopifyProduct(handle).catch(() => null);
  if (!product) return { title: "Không tìm thấy sản phẩm", robots: { index: false, follow: false } };
  const title = product.seo.title || product.title;
  const description = product.seo.description || product.description || fallbackDescription;
  const url = `/shop/${encodeURIComponent(product.handle)}`;
  const images = product.featuredImage ? [{ url: product.featuredImage.url, alt: product.featuredImage.altText || product.title }] : [];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, images },
    twitter: { card: "summary_large_image", title, description, images: images.map(image => image.url) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const handle = decodeURIComponent(slug);
  const [product, products] = await Promise.all([
    getShopifyProduct(handle).catch(() => null),
    getShopifyProducts().catch(() => [] as ShopifyProduct[]),
  ]);
  if (!product) return <main className="not-found"><h1>Không tìm thấy sản phẩm.</h1><a href="/shop">← Về cửa hàng</a></main>;
  const description = product.seo.description || product.description || fallbackDescription;
  const url = `${SITE_URL}/shop/${encodeURIComponent(product.handle)}`;
  const price = product.variants.nodes[0]?.price;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description,
    url,
    image: product.images.nodes.map(image => image.url),
    sku: product.variants.nodes[0]?.id,
    brand: { "@type": "Brand", name: "humm." },
    offers: price ? {
      "@type": "Offer",
      url,
      priceCurrency: price.currencyCode,
      price: price.amount,
      availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    } : undefined,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Cửa hàng", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: product.title, item: url },
    ],
  };
  const relatedProducts = products.filter(item => item.id !== product.id).slice(0, 3);

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbJsonLd) }} />
    <ProductClient product={product} relatedProducts={relatedProducts} />
  </>;
}
