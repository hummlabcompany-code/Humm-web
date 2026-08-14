import type { MetadataRoute } from "next";
import { getShopifyProducts } from "./shop/shopify";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const base = "https://humm-store.customkeyrambitvn.chatgpt.site"; const products = await getShopifyProducts().catch(() => []); return [{ url: base, priority: 1 }, { url: `${base}/shop`, priority: .9 }, { url: `${base}/mua-hang-an-tam`, priority: .5 }, ...products.map(product => ({ url: `${base}/shop/${encodeURIComponent(product.handle)}`, lastModified: new Date(product.createdAt), priority: .8 }))]; }
