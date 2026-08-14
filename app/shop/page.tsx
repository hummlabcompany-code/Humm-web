import { getShopifyProducts } from "./shopify";
import CatalogClient from "./catalog-client";

export default async function ShopPage() {
  try { return <CatalogClient initialProducts={await getShopifyProducts()} />; }
  catch (error) { return <CatalogClient initialProducts={[]} loadError={error instanceof Error ? error.message : "Không tải được sản phẩm"} />; }
}
