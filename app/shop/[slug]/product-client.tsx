"use client";

import { useEffect, useState } from "react";
import { useCart } from "../cart";
import { money } from "../products";
import { productPrice, ShopifyProduct, ShopifyVariant } from "../shopify";
import { track } from "../track";

export default function ProductClient({ product, relatedProducts }: { product: ShopifyProduct; relatedProducts: ShopifyProduct[] }) {
  const [variant, setVariant] = useState<ShopifyVariant | null>(product.variants.nodes[0] || null);
  const [imageIndex, setImageIndex] = useState(0);
  const { items, setOpen, add, busy, error } = useCart();

  useEffect(() => { track("product_view", product.handle); }, [product.handle]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const images = product.images.nodes;
  const currentImage = images[imageIndex];
  const available = !!variant?.availableForSale;
  const optionNames = [...new Set(product.variants.nodes.flatMap(item => item.selectedOptions.map(option => option.name)))].filter(name => name !== "Title");
  const specs = [
    ["Kích thước", product.size?.value],
    ["Chất liệu", product.material?.value],
    ["Ánh sáng", product.light?.value],
    ["Thời gian làm", product.printTime?.value],
    ["Bảo hành", product.warranty?.value],
  ].filter((item): item is string[] => !!item[1]);

  function chooseOption(name: string, value: string) {
    const next = product.variants.nodes.find(item => item.selectedOptions.every(option => (
      option.name === name
        ? option.value === value
        : variant?.selectedOptions.some(current => current.name === option.name && current.value === option.value)
    )));
    if (next) setVariant(next);
  }

  return <main className="shop-page">
    <nav className="nav shop-nav" aria-label="Điều hướng chính">
      <a className="logo" href="/">humm<span>.</span></a>
      <div className="top-tabs"><a href="/">Trang chủ</a><a className="active" href="/shop" aria-current="page">Cửa hàng</a></div>
      <button className="cart" onClick={() => setOpen(true)} aria-label={`Mở giỏ hàng, ${count} sản phẩm`}>Giỏ hàng <b>{count}</b></button>
    </nav>

    <nav className="breadcrumbs" aria-label="Đường dẫn trang">
      <ol>
        <li><a href="/">Trang chủ</a></li>
        <li><a href="/shop">Cửa hàng</a></li>
        <li aria-current="page">{product.title}</li>
      </ol>
    </nav>

    <section className="pdp shopify-pdp">
      <div className={`pdp-visual ${!currentImage ? "empty-product-image" : ""}`}>
        <a className="back-shop" href="/shop">← Tất cả sản phẩm</a>
        {currentImage
          ? <img className="pdp-product-image" src={currentImage.url} alt={currentImage.altText || product.title} />
          : <span className="media-placeholder">Ảnh sản phẩm đang cập nhật</span>}
        {images.length > 1 && <button className="light-switch" onClick={() => setImageIndex(index => index === 0 ? 1 : 0)} aria-label="Chuyển giữa ảnh đèn tắt và bật"><i className={imageIndex === 1 ? "on" : ""} />{imageIndex === 0 ? "Đèn tắt" : "Đèn bật"}</button>}
      </div>
      <div className="pdp-info">
        <p className="eyebrow">3D printed companion</p>
        <h1>{product.title}</h1>
        {variant && <strong className="pdp-price">{money(Number(variant.price.amount))}</strong>}
        {product.description && <p className="pdp-story">{product.description}</p>}
        {optionNames.map(name => <fieldset key={name}>
          <legend>{name} · <b>{variant?.selectedOptions.find(option => option.name === name)?.value}</b></legend>
          <div className="variant-options">{[...new Set(product.variants.nodes.flatMap(item => item.selectedOptions.filter(option => option.name === name).map(option => option.value)))].map(value => <button type="button" className={variant?.selectedOptions.some(option => option.name === name && option.value === value) ? "selected" : ""} onClick={() => chooseOption(name, value)} key={value}>{value}</button>)}</div>
        </fieldset>)}
        <button className="add-button sticky-mobile-add" disabled={!available || busy} onClick={() => variant && add(variant.id, product.handle)}>{busy ? "Đang thêm…" : available ? "Thêm vào giỏ" : "Tạm hết hàng"}<span>{available && !busy ? "+" : ""}</span></button>
        {error && <p className="form-error" role="alert">{error}</p>}
        {specs.length > 0 && <dl className="product-specs">{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
        {images.length > 1 && <div className="product-thumbnails">{images.map((image, index) => <button type="button" aria-label={`Xem ảnh ${index + 1}`} className={index === imageIndex ? "active" : ""} onClick={() => setImageIndex(index)} key={image.url}><img src={image.url} alt={image.altText || `${product.title} ${index + 1}`} /></button>)}</div>}
      </div>
    </section>

    {relatedProducts.length > 0 && <section className="related-products" aria-labelledby="related-title">
      <p className="eyebrow">you may also like</p>
      <h2 id="related-title">Những người bạn khác.</h2>
      <div className="products">{relatedProducts.map((item, index) => <article className={`product tone-${index % 3}`} key={item.id}>
        <a className={`product-art ${!item.featuredImage ? "empty-media" : ""}`} href={`/shop/${encodeURIComponent(item.handle)}`}>
          <span className="number">{String(index + 1).padStart(2, "0")}</span>
          <span className="new-tag">{item.availableForSale ? "made to order" : "tạm hết hàng"}</span>
          {item.featuredImage ? <img src={item.featuredImage.url} alt={item.featuredImage.altText || item.title} /> : <span className="media-placeholder">Ảnh đang cập nhật</span>}
        </a>
        <div className="product-info"><div><h2>{item.title}</h2>{item.description && <p>{item.description}</p>}</div><a className="round-link" href={`/shop/${encodeURIComponent(item.handle)}`} aria-label={`Xem ${item.title}`}>→</a></div>
        <strong>{money(productPrice(item))}</strong>
      </article>)}</div>
    </section>}

    <section className="shop-promise">
      <div><span>01</span><h3>In chậm, làm kỹ</h3><p>Mỗi chiếc đèn được in và hoàn thiện bằng tay.</p></div>
      <div><span>02</span><h3>Giá luôn đồng bộ</h3><p>Giỏ hàng đọc trực tiếp giá và tồn kho Shopify.</p></div>
      <div><span>03</span><h3>Thanh toán bảo mật</h3><p>Bạn hoàn tất đơn hàng trên Shopify Checkout.</p></div>
    </section>
  </main>;
}
