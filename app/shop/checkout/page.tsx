"use client";
import {useCart} from "../cart";
import {money} from "../products";

export default function CheckoutPage(){
 const{items,subtotal,checkout,checkingOut,checkoutError}=useCart();
 return <main className="checkout-page"><nav className="nav"><a className="logo" href="/">humm<span>.</span></a><a className="checkout-back" href="/shop">← Tiếp tục mua</a><span className="secure">Shopify secure checkout</span></nav><div className="checkout-grid"><section><p className="eyebrow">one last tiny step</p><h1>Thanh toán<br/>qua Shopify.</h1>{!items.length?<div className="checkout-empty"><p>Giỏ hàng đang trống hoặc chứa dữ liệu từ phiên bản cũ.</p><a href="/shop">Chọn sản phẩm →</a></div>:<div className="shopify-checkout-card"><p>Địa chỉ giao hàng, phương thức vận chuyển, giảm giá và thanh toán sẽ được xác nhận an toàn trên Shopify.</p>{checkoutError&&<p className="form-error">{checkoutError}</p>}<button className="place-order" onClick={checkout} disabled={checkingOut}>{checkingOut?"Đang mở Shopify…":`Tiếp tục · ${money(subtotal)}`}</button></div>}</section><aside className="order-summary"><h2>Đơn của bạn</h2>{items.map(x=><div className="summary-item" key={x.variantId}>{x.image?<img className="summary-product-image" src={x.image} alt=""/>:<div className="summary-thumb"/>}<div><b>{x.name}</b>{x.option!=="Default Title"&&<span>{x.option}</span>}</div><strong>{money(x.price*x.quantity)}</strong></div>)}<div className="summary-totals"><p><span>Tạm tính</span><b>{money(subtotal)}</b></p><p><span>Vận chuyển</span><b>Tính tại Shopify</b></p></div></aside></div></main>
}
