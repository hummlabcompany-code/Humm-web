import type { Metadata } from "next";
import { getShopifyProduct } from "../shopify";
import ProductClient from "./product-client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const product = await getShopifyProduct(decodeURIComponent(slug)).catch(() => null);
  if (!product) return { title: "Không tìm thấy sản phẩm | humm." };
  return { title: product.seo.title || `${product.title} | humm.`, description: product.seo.description || product.description || "Đèn in 3D đầy màu sắc từ humm.", openGraph: { title: product.seo.title || product.title, description: product.seo.description || product.description || undefined, images: product.featuredImage ? [{ url: product.featuredImage.url, alt: product.featuredImage.altText || product.title }] : undefined } };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const product = await getShopifyProduct(decodeURIComponent(slug)).catch(() => null);
  if (!product) return <main className="not-found"><h1>Không tìm thấy sản phẩm.</h1><a href="/shop">← Về cửa hàng</a></main>;
  return <ProductClient product={product} />;
}
