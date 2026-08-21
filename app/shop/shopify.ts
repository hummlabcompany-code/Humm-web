export const SHOPIFY_DOMAIN = "humm-4500.myshopify.com";
export const SHOPIFY_STOREFRONT_TOKEN = "2eaff3d2bc8f228d541e0ddb39802e57";

export type Money = { amount: string; currencyCode: string };
export type ShopifyImage = { url: string; altText: string | null; width: number | null; height: number | null };
export type ShopifyModel3dSource = { url: string; format: string; mimeType: string };
export type ShopifyModel3d = { id: string; mediaContentType: "MODEL_3D"; alt: string | null; previewImage: ShopifyImage | null; sources: ShopifyModel3dSource[] };
export type ShopifyVariant = { id: string; title: string; availableForSale: boolean; quantityAvailable: number | null; price: Money; selectedOptions: { name: string; value: string }[] };
export type ShopifyProduct = {
  id: string; handle: string; title: string; description: string; availableForSale: boolean;
  createdAt: string; productType: string; tags: string[]; seo: { title: string | null; description: string | null };
  featuredImage: ShopifyImage | null; images: { nodes: ShopifyImage[] }; variants: { nodes: ShopifyVariant[] };
  media?: { nodes: ShopifyModel3d[] };
  size: { value: string } | null; material: { value: string } | null; light: { value: string } | null;
  printTime: { value: string } | null; warranty: { value: string } | null;
};

export type ShopifyCartLine = {
  id: string; quantity: number;
  merchandise: ShopifyVariant & { product: { handle: string; title: string; featuredImage: ShopifyImage | null } };
};
export type ShopifyCart = { id: string; checkoutUrl: string; totalQuantity: number; cost: { subtotalAmount: Money }; lines: { nodes: ShopifyCartLine[] } };

const productFields = `id handle title description availableForSale createdAt productType tags seo{title description}
 featuredImage{url altText width height} images(first:20){nodes{url altText width height}}
 variants(first:50){nodes{id title availableForSale quantityAvailable price{amount currencyCode} selectedOptions{name value}}}
 size:metafield(namespace:"custom",key:"size"){value} material:metafield(namespace:"custom",key:"material"){value}
 light:metafield(namespace:"custom",key:"light"){value} printTime:metafield(namespace:"custom",key:"print_time"){value}
 warranty:metafield(namespace:"custom",key:"warranty"){value}`;
const productDetailFields = `${productFields}
 media(first:20){nodes{mediaContentType alt previewImage{url altText width height}
  ... on Model3d{id sources{url format mimeType}}}}`;
const cartFields = `id checkoutUrl totalQuantity cost{subtotalAmount{amount currencyCode}} lines(first:100){nodes{id quantity merchandise{... on ProductVariant{id title availableForSale quantityAvailable price{amount currencyCode} selectedOptions{name value} product{handle title featuredImage{url altText width height}}}}}}`;

async function query<T>(graphql: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2026-04/graphql.json`, {
    method: "POST", cache: "no-store",
    headers: { "content-type": "application/json", "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN },
    body: JSON.stringify({ query: graphql, variables }),
  });
  const payload = await response.json() as { data?: T; errors?: { message: string }[] };
  if (!response.ok || payload.errors || !payload.data) throw new Error(payload.errors?.[0]?.message || "Không kết nối được Shopify");
  return payload.data;
}

function mutationResult<T extends { cart: ShopifyCart | null; userErrors: { message: string }[] }>(result: T) {
  const error = result.userErrors[0];
  if (error || !result.cart) throw new Error(error?.message || "Không thể cập nhật giỏ hàng Shopify");
  return result.cart;
}

export async function getShopifyProducts() {
  const products: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage && products.length < 250) {
    const data: { products: { nodes: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await query(
      `query Products($cursor:String){products(first:50,after:$cursor,sortKey:CREATED_AT,reverse:true){nodes{${productFields}} pageInfo{hasNextPage endCursor}}}`,
      { cursor },
    );
    products.push(...data.products.nodes);
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return products;
}
export async function getShopifyProduct(handle: string) {
  const data = await query<{ product: ShopifyProduct | null }>(`query Product($handle:String!){product(handle:$handle){${productDetailFields}}}`, { handle });
  return data.product;
}
export const productPrice = (product: ShopifyProduct) => Number(product.variants.nodes[0]?.price.amount || 0);
export const productModel = (product: ShopifyProduct) => product.media?.nodes.find(media => media.mediaContentType === "MODEL_3D") || null;

export async function getShopifyCart(id: string) {
  const data = await query<{ cart: ShopifyCart | null }>(`query Cart($id:ID!){cart(id:$id){${cartFields}}}`, { id });
  return data.cart;
}
export async function createShopifyCart(merchandiseId: string, quantity = 1) {
  const data = await query<{ cartCreate: { cart: ShopifyCart | null; userErrors: { message: string }[] } }>(`mutation CreateCart($lines:[CartLineInput!]!){cartCreate(input:{lines:$lines}){cart{${cartFields}} userErrors{message}}}`, { lines: [{ merchandiseId, quantity }] });
  return mutationResult(data.cartCreate);
}
export async function addShopifyCartLine(cartId: string, merchandiseId: string, quantity = 1) {
  const data = await query<{ cartLinesAdd: { cart: ShopifyCart | null; userErrors: { message: string }[] } }>(`mutation AddLine($cartId:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$cartId,lines:$lines){cart{${cartFields}} userErrors{message}}}`, { cartId, lines: [{ merchandiseId, quantity }] });
  return mutationResult(data.cartLinesAdd);
}
export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await query<{ cartLinesUpdate: { cart: ShopifyCart | null; userErrors: { message: string }[] } }>(`mutation UpdateLine($cartId:ID!,$lines:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$cartId,lines:$lines){cart{${cartFields}} userErrors{message}}}`, { cartId, lines: [{ id: lineId, quantity }] });
  return mutationResult(data.cartLinesUpdate);
}
