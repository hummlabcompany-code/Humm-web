"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { money } from "./products";
import { addShopifyCartLine, createShopifyCart, getShopifyCart, ShopifyCart, updateShopifyCartLine } from "./shopify";
import { track } from "./track";

export type CartItem = { lineId: string; variantId: string; slug: string; name: string; option: string; image?: string; quantity: number; price: number; available: boolean };
type CartValue = { items: CartItem[]; open: boolean; setOpen: (v: boolean) => void; add: (variantId: string, slug: string) => Promise<void>; change: (lineId: string, quantity: number) => Promise<void>; subtotal: number; checkout: () => void; busy: boolean; error: string };
const CartContext = createContext<CartValue | null>(null);
const CART_KEY = "humm-shopify-cart";

function cartItems(cart: ShopifyCart | null): CartItem[] {
  return cart?.lines.nodes.map(line => ({ lineId: line.id, variantId: line.merchandise.id, slug: line.merchandise.product.handle, name: line.merchandise.product.title, option: line.merchandise.title, image: line.merchandise.product.featuredImage?.url, quantity: line.quantity, price: Number(line.merchandise.price.amount), available: line.merchandise.availableForSale })) || [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null), [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { const id = localStorage.getItem(CART_KEY); if (id) getShopifyCart(id).then(current => { if (current) setCart(current); else localStorage.removeItem(CART_KEY); }).catch(() => localStorage.removeItem(CART_KEY)); }, []);
  const items = useMemo(() => cartItems(cart), [cart]);
  const subtotal = Number(cart?.cost.subtotalAmount.amount || 0);
  async function add(variantId: string, slug: string) {
    if (busy) return; setBusy(true); setError("");
    try { const next = cart ? await addShopifyCartLine(cart.id, variantId) : await createShopifyCart(variantId); setCart(next); localStorage.setItem(CART_KEY, next.id); track("add_to_cart", slug, { variantId }); setOpen(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể thêm sản phẩm"); setOpen(true); }
    finally { setBusy(false); }
  }
  async function change(lineId: string, quantity: number) {
    if (!cart || busy) return; setBusy(true); setError("");
    try { setCart(await updateShopifyCartLine(cart.id, lineId, Math.max(0, quantity))); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể cập nhật giỏ hàng"); }
    finally { setBusy(false); }
  }
  function checkout() { if (!cart?.checkoutUrl) return; track("begin_checkout", undefined, { items: cart.totalQuantity }); location.href = cart.checkoutUrl; }
  return <CartContext.Provider value={{ items, open, setOpen, add, change, subtotal, checkout, busy, error }}>{children}<div className={`drawer-backdrop ${open ? "show" : ""}`} onClick={() => setOpen(false)} /><aside className={`cart-drawer ${open ? "open" : ""}`} aria-hidden={!open} aria-label="Giỏ hàng"><div className="drawer-head"><div><span>your happy cart</span><h2>Giỏ hàng</h2></div><button onClick={() => setOpen(false)} aria-label="Đóng giỏ">×</button></div><div className="drawer-items">{!items.length ? <p className="empty-cart">Chưa có chiếc đèn nào ở đây.<br />Một người bạn đang chờ bạn chọn ✦</p> : items.map(x => <div className="drawer-item" key={x.lineId}>{x.image ? <img className="cart-product-image" src={x.image} alt="" /> : <div className="cart-thumb">Ảnh đang cập nhật</div>}<div><b>{x.name}</b>{x.option !== "Default Title" && <small>{x.option}</small>}<div className="qty"><button disabled={busy} onClick={() => change(x.lineId, x.quantity - 1)} aria-label="Giảm số lượng">−</button><span>{x.quantity}</span><button disabled={busy} onClick={() => change(x.lineId, x.quantity + 1)} aria-label="Tăng số lượng">+</button></div></div><strong>{money(x.price * x.quantity)}</strong></div>)}</div>{error && <p className="form-error cart-error">{error}</p>}{items.length > 0 && <div className="drawer-total"><div><span>Tạm tính</span><b>{money(subtotal)}</b></div><small>Giá và tồn kho lấy trực tiếp từ Shopify. Phí giao hàng và thanh toán được xác nhận tại checkout.</small><button className="shopify-checkout" onClick={checkout} disabled={busy || items.some(x => !x.available)}>{items.some(x => !x.available) ? "Có sản phẩm tạm hết hàng" : "Thanh toán an toàn →"}</button></div>}</aside></CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("CartProvider missing"); return value; }
