"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { money } from "./products";
import { addShopifyCartLine, createShopifyCart, getShopifyCart, ShopifyCart, updateShopifyCartLine } from "./shopify";
import { track } from "./track";

export type CartItem = { lineId: string; variantId: string; slug: string; name: string; option: string; image?: string; quantity: number; price: number; available: boolean };
type CartValue = { items: CartItem[]; open: boolean; setOpen: (value: boolean) => void; add: (variantId: string, slug: string) => Promise<void>; change: (lineId: string, quantity: number) => Promise<void>; subtotal: number; checkout: () => void; busy: boolean; error: string };
const CartContext = createContext<CartValue | null>(null);
const CART_KEY = "humm-shopify-cart";

function cartItems(cart: ShopifyCart | null): CartItem[] {
  return cart?.lines.nodes.map(line => ({
    lineId: line.id,
    variantId: line.merchandise.id,
    slug: line.merchandise.product.handle,
    name: line.merchandise.product.title,
    option: line.merchandise.title,
    image: line.merchandise.product.featuredImage?.url,
    quantity: line.quantity,
    price: Number(line.merchandise.price.amount),
    available: line.merchandise.availableForSale,
  })) || [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [open, setOpenState] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const drawerRef = useRef<HTMLElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const id = localStorage.getItem(CART_KEY);
    if (!id) return;
    getShopifyCart(id).then(current => {
      if (current) setCart(current);
      else localStorage.removeItem(CART_KEY);
    }).catch(() => localStorage.removeItem(CART_KEY));
  }, []);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
    (focusable?.[0] || drawer)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpenState(false);
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const available = [...drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!available.length) return;
      const first = available[0];
      const last = available[available.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocusRef.current?.focus();
    };
  }, [open]);

  const items = useMemo(() => cartItems(cart), [cart]);
  const subtotal = Number(cart?.cost.subtotalAmount.amount || 0);

  function setOpen(value: boolean) {
    if (value && !open) lastFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpenState(value);
  }

  async function add(variantId: string, slug: string) {
    if (busy) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setBusy(true);
    setError("");
    try {
      const next = cart ? await addShopifyCartLine(cart.id, variantId) : await createShopifyCart(variantId);
      setCart(next);
      localStorage.setItem(CART_KEY, next.id);
      track("add_to_cart", slug, { variantId });
      lastFocusRef.current = trigger;
      setOpenState(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể thêm sản phẩm");
      lastFocusRef.current = trigger;
      setOpenState(true);
    } finally {
      setBusy(false);
    }
  }

  async function change(lineId: string, quantity: number) {
    if (!cart || busy) return;
    setBusy(true);
    setError("");
    try {
      setCart(await updateShopifyCartLine(cart.id, lineId, Math.max(0, quantity)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể cập nhật giỏ hàng");
    } finally {
      setBusy(false);
    }
  }

  function checkout() {
    if (!cart?.checkoutUrl) return;
    track("begin_checkout", undefined, { items: cart.totalQuantity });
    location.href = cart.checkoutUrl;
  }

  return <CartContext.Provider value={{ items, open, setOpen, add, change, subtotal, checkout, busy, error }}>
    {children}
    <p className="sr-only" aria-live="polite">Giỏ hàng có {items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</p>
    <div className={`drawer-backdrop ${open ? "show" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
    <aside ref={drawerRef} className={`cart-drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-labelledby="cart-title" tabIndex={-1} inert={!open}>
      <div className="drawer-head"><div><span>your happy cart</span><h2 id="cart-title">Giỏ hàng</h2></div><button onClick={() => setOpen(false)} aria-label="Đóng giỏ">×</button></div>
      <div className="drawer-items">{!items.length
        ? <p className="empty-cart">Chưa có chiếc đèn nào ở đây.<br />Một người bạn đang chờ bạn chọn ✦</p>
        : items.map(item => <div className="drawer-item" key={item.lineId}>
          {item.image ? <img className="cart-product-image" src={item.image} alt="" /> : <div className="cart-thumb">Ảnh đang cập nhật</div>}
          <div><b>{item.name}</b>{item.option !== "Default Title" && <small>{item.option}</small>}<div className="qty"><button disabled={busy} onClick={() => change(item.lineId, item.quantity - 1)} aria-label={`Giảm số lượng ${item.name}`}>−</button><span aria-label={`Số lượng ${item.quantity}`}>{item.quantity}</span><button disabled={busy} onClick={() => change(item.lineId, item.quantity + 1)} aria-label={`Tăng số lượng ${item.name}`}>+</button></div></div>
          <strong>{money(item.price * item.quantity)}</strong>
        </div>)}</div>
      {error && <p className="form-error cart-error" role="alert">{error}</p>}
      {items.length > 0 && <div className="drawer-total"><div><span>Tạm tính</span><b>{money(subtotal)}</b></div><small>Giá và tồn kho lấy trực tiếp từ Shopify. Phí giao hàng và thanh toán được xác nhận tại checkout.</small><button className="shopify-checkout" onClick={checkout} disabled={busy || items.some(item => !item.available)}>{items.some(item => !item.available) ? "Có sản phẩm tạm hết hàng" : "Thanh toán an toàn →"}</button></div>}
    </aside>
  </CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartProvider missing");
  return value;
}
