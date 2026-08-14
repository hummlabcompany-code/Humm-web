import { getDb } from "../../../db";
import { orders } from "../../../db/schema";
import { env } from "cloudflare:workers";

type OrderPayload = { customerName?: string; phone?: string; address?: string; note?: string; paymentMethod?: "cod"|"bank"; items?: Array<{slug:string;name:string;color:string;giftWrap?:boolean;quantity:number;price:number}> };

export async function POST(request: Request) {
  try {
    await env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_code TEXT NOT NULL UNIQUE, customer_name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', payment_method TEXT NOT NULL, items_json TEXT NOT NULL, subtotal INTEGER NOT NULL, shipping_fee INTEGER NOT NULL, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS orders_order_code_unique ON orders(order_code)`),
    ]);
    const payload = await request.json() as OrderPayload;
    const name = payload.customerName?.trim() ?? "";
    const phone = payload.phone?.trim() ?? "";
    const address = payload.address?.trim() ?? "";
    const items = payload.items ?? [];
    if (!name || !/^0\d{8,10}$/.test(phone) || !address || !items.length) return Response.json({error:"Thông tin đơn hàng chưa hợp lệ."},{status:400});
    const allowed = new Map([["momo",1290000],["pip",1490000],["bibi",1390000]]);
    if (items.some(item => !allowed.has(item.slug) || item.quantity < 1 || item.quantity > 9 || allowed.get(item.slug)!==item.price)) return Response.json({error:"Sản phẩm không hợp lệ."},{status:400});
    const subtotal = items.reduce((sum,item)=>sum+(item.price+(item.giftWrap?80000:0))*item.quantity,0);
    const shippingFee = subtotal >= 1500000 ? 0 : 40000;
    const orderCode = `HUMM-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
    await getDb().insert(orders).values({orderCode,customerName:name,phone,address,note:payload.note?.trim()??"",paymentMethod:payload.paymentMethod==="bank"?"bank":"cod",itemsJson:JSON.stringify(items),subtotal,shippingFee,total:subtotal+shippingFee});
    return Response.json({orderCode,total:subtotal+shippingFee},{status:201});
  } catch (error) {
    return Response.json({error:error instanceof Error?error.message:"Không thể tạo đơn hàng."},{status:500});
  }
}
