export const SHOPIFY_DOMAIN="humm-4500.myshopify.com";
export const SHOPIFY_STOREFRONT_TOKEN="2eaff3d2bc8f228d541e0ddb39802e57";

export type ShopifyImage={url:string;altText:string|null;width:number|null;height:number|null};
export type ShopifyVariant={id:string;title:string;availableForSale:boolean;quantityAvailable:number|null;price:{amount:string;currencyCode:string};selectedOptions:{name:string;value:string}[]};
export type ShopifyProduct={id:string;handle:string;title:string;description:string;availableForSale:boolean;featuredImage:ShopifyImage|null;images:{nodes:ShopifyImage[]};variants:{nodes:ShopifyVariant[]}};

const fields=`id handle title description availableForSale featuredImage { url altText width height } images(first:20){nodes{url altText width height}} variants(first:50){nodes{id title availableForSale quantityAvailable price{amount currencyCode} selectedOptions{name value}}}`;

async function query<T>(graphql:string,variables:Record<string,unknown>={}):Promise<T>{
 const response=await fetch(`https://${SHOPIFY_DOMAIN}/api/2026-04/graphql.json`,{method:"POST",headers:{"content-type":"application/json","X-Shopify-Storefront-Access-Token":SHOPIFY_STOREFRONT_TOKEN},body:JSON.stringify({query:graphql,variables})});
 const payload=await response.json() as {data?:T;errors?:{message:string}[]};
 if(!response.ok||payload.errors||!payload.data)throw new Error(payload.errors?.[0]?.message||"Không tải được sản phẩm Shopify");
 return payload.data;
}
export async function getShopifyProducts(){const data=await query<{products:{nodes:ShopifyProduct[]}}>(`query{products(first:50,sortKey:CREATED_AT,reverse:true){nodes{${fields}}}}`);return data.products.nodes}
export async function getShopifyProduct(handle:string){const data=await query<{product:ShopifyProduct|null}>(`query Product($handle:String!){product(handle:$handle){${fields}}}`,{handle});return data.product}
export const productPrice=(product:ShopifyProduct)=>Number(product.variants.nodes[0]?.price.amount||0);
