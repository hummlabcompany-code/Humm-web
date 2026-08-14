"use client";
import {createContext,useContext,useEffect,useMemo,useState} from "react";
import {money} from "./products";
import {createShopifyCheckout} from "./shopify";
import {track} from "./track";

export type CartItem={variantId:string;slug:string;name:string;option:string;image?:string;quantity:number;price:number};
type CartValue={items:CartItem[];open:boolean;setOpen:(v:boolean)=>void;add:(item:Omit<CartItem,"quantity">)=>void;change:(variantId:string,delta:number)=>void;clear:()=>void;subtotal:number;checkout:()=>Promise<void>;checkingOut:boolean;checkoutError:string};
const CartContext=createContext<CartValue|null>(null);

export function CartProvider({children}:{children:React.ReactNode}){
 const[items,setItems]=useState<CartItem[]>([]),[open,setOpen]=useState(false),[ready,setReady]=useState(false),[checkingOut,setCheckingOut]=useState(false),[checkoutError,setCheckoutError]=useState("");
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem("humm-cart")||"[]") as CartItem[];setItems(saved.filter(x=>x.variantId))}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("humm-cart",JSON.stringify(items))},[items,ready]);
 const add=(item:Omit<CartItem,"quantity">)=>{setItems(current=>{const found=current.find(x=>x.variantId===item.variantId);return found?current.map(x=>x.variantId===item.variantId?{...x,quantity:x.quantity+1}:x):[...current,{...item,quantity:1}]});track("add_to_cart",item.slug,{variantId:item.variantId});setOpen(true)};
 const change=(variantId:string,delta:number)=>setItems(current=>current.map(x=>x.variantId===variantId?{...x,quantity:x.quantity+delta}:x).filter(x=>x.quantity>0));
 const subtotal=useMemo(()=>items.reduce((sum,item)=>sum+item.price*item.quantity,0),[items]);
 async function checkout(){if(!items.length)return;setCheckingOut(true);setCheckoutError("");try{track("begin_checkout",undefined,{items:items.length});const url=await createShopifyCheckout(items.map(x=>({merchandiseId:x.variantId,quantity:x.quantity})));location.href=url}catch(error){setCheckoutError(error instanceof Error?error.message:"Không thể mở Shopify Checkout");setCheckingOut(false)}}
 return <CartContext.Provider value={{items,open,setOpen,add,change,clear:()=>setItems([]),subtotal,checkout,checkingOut,checkoutError}}>{children}<div className={`drawer-backdrop ${open?"show":""}`} onClick={()=>setOpen(false)}/><aside className={`cart-drawer ${open?"open":""}`} aria-hidden={!open}><div className="drawer-head"><div><span>your happy cart</span><h2>Giỏ hàng</h2></div><button onClick={()=>setOpen(false)} aria-label="Đóng giỏ">×</button></div><div className="drawer-items">{!items.length?<p className="empty-cart">Chưa có chiếc đèn nào ở đây.<br/>Một người bạn đang chờ bạn chọn ✦</p>:items.map(x=><div className="drawer-item" key={x.variantId}>{x.image?<img className="cart-product-image" src={x.image} alt=""/>:<div className="cart-thumb"/>}<div><b>{x.name}</b>{x.option!=="Default Title"&&<small>{x.option}</small>}<div className="qty"><button onClick={()=>change(x.variantId,-1)} aria-label="Giảm số lượng">−</button><span>{x.quantity}</span><button onClick={()=>change(x.variantId,1)} aria-label="Tăng số lượng">+</button></div></div><strong>{money(x.price*x.quantity)}</strong></div>)}</div>{items.length>0&&<div className="drawer-total"><div><span>Tạm tính</span><b>{money(subtotal)}</b></div><small>Phí vận chuyển và phương thức thanh toán được xác nhận tại Shopify Checkout.</small>{checkoutError&&<p className="form-error">{checkoutError}</p>}<button className="shopify-checkout" onClick={checkout} disabled={checkingOut}>{checkingOut?"Đang chuyển sang Shopify…":"Thanh toán an toàn →"}</button></div>}</aside></CartContext.Provider>
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error("CartProvider missing");return value}
