"use client";

import { useCallback, useEffect, useState } from "react";
import { useCart } from "../cart";
import { money } from "../products";
import { productModel, productPrice, ShopifyModel3d, ShopifyProduct, ShopifyVariant } from "../shopify";
import { track } from "../track";
import ProductModelViewer, { HummModelViewerElement } from "./product-model-viewer";

const HUMM_DEMO_CUBE: ShopifyModel3d = {
  id: "humm-demo-cube-20cm",
  mediaContentType: "MODEL_3D",
  alt: "Khối lập phương mẫu màu coral, cạnh 20 cm",
  previewImage: null,
  sources: [{ url: "/models/humm-cube-20cm.glb", format: "glb", mimeType: "model/gltf-binary" }],
};

export default function ProductClient({ product, relatedProducts }: { product: ShopifyProduct; relatedProducts: ShopifyProduct[] }) {
  const [variant, setVariant] = useState<ShopifyVariant | null>(product.variants.nodes[0] || null);
  const [imageIndex, setImageIndex] = useState(0);
  const shopifyModel = productModel(product);
  const demoModel = product.handle === "den-sang-tạo" ? HUMM_DEMO_CUBE : null;
  const model = shopifyModel || demoModel;
  const isDemoModel = model?.id === HUMM_DEMO_CUBE.id;
  const glbSource = model?.sources.find(source => source.format.toLowerCase() === "glb" || source.mimeType === "model/gltf-binary");
  const usdzSource = model?.sources.find(source => source.format.toLowerCase() === "usdz" || source.mimeType === "model/vnd.usdz+zip");
  const hasModel = !!glbSource;
  const [mediaMode, setMediaMode] = useState<"image" | "model">(product.images.nodes.length || !hasModel ? "image" : "model");
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [lit, setLit] = useState(false);
  const [arMessage, setArMessage] = useState("");
  const { items, setOpen, add, busy, error } = useCart();

  useEffect(() => { track("product_view", product.handle); }, [product.handle]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const images = product.images.nodes;
  const currentImage = images[imageIndex];
  const viewerId = `humm-model-${product.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
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

  const handleModelError = useCallback(() => {
    setModelError(true);
    setArMessage("Mô hình 3D đang được Shopify xử lý. Bạn thử lại sau nhé.");
  }, []);

  async function openRoomPreview() {
    setMediaMode("model");
    setArMessage("");
    track("ar_open", product.handle);
    const viewer = document.getElementById(viewerId) as HummModelViewerElement | null;
    if (!viewer?.canActivateAR) {
      setArMessage("Bạn đang ở chế độ xem 3D. Mở trang này trên điện thoại hỗ trợ AR để ướm đèn bằng camera.");
      return;
    }
    try { await viewer.activateAR(); }
    catch { setArMessage("Thiết bị chưa thể mở camera AR. Bạn vẫn có thể xoay và xem đèn ở chế độ 3D."); }
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
      <div className={`pdp-visual ${!currentImage && !hasModel ? "empty-product-image" : ""} ${mediaMode === "model" ? "showing-model" : ""}`}>
        <a className="back-shop" href="/shop">← Tất cả sản phẩm</a>
        {hasModel && <div className="media-tabs" role="tablist" aria-label="Chế độ xem sản phẩm"><button type="button" role="tab" aria-selected={mediaMode === "image"} className={mediaMode === "image" ? "active" : ""} onClick={() => setMediaMode("image")}>Ảnh</button><button type="button" role="tab" aria-selected={mediaMode === "model"} className={mediaMode === "model" ? "active" : ""} onClick={() => { setMediaMode("model"); track("model_view", product.handle); }}>Xem 3D</button></div>}
        <div className={`media-layer image-layer ${mediaMode === "image" ? "active" : ""}`} aria-hidden={mediaMode !== "image"}>
          {currentImage
            ? <img className="pdp-product-image" src={currentImage.url} alt={currentImage.altText || product.title} />
            : <span className="media-placeholder">Ảnh sản phẩm đang cập nhật</span>}
        </div>
        {hasModel && <div className={`media-layer model-layer ${mediaMode === "model" ? "active" : ""}`} aria-hidden={mediaMode !== "model"}>
          <div className={`model-glow ${lit ? "on" : ""}`} aria-hidden="true" />
          <ProductModelViewer id={viewerId} src={glbSource!.url} iosSrc={usdzSource?.url} poster={model?.previewImage?.url || currentImage?.url} alt={model?.alt || `Mô hình 3D ${product.title}`} lit={lit} active={mediaMode === "model"} onReady={() => { setModelReady(true); setModelError(false); }} onError={handleModelError} />
          {isDemoModel && <span className="model-demo-badge">Model mẫu · 20 × 20 × 20 cm</span>}
          <p className="model-instruction">Kéo để xoay · chụm để phóng to</p>
        </div>}
        {mediaMode === "image" && images.length > 1 && <button className="light-switch" onClick={() => setImageIndex(index => index === 0 ? 1 : 0)} aria-label="Chuyển giữa ảnh đèn tắt và bật"><i className={imageIndex === 1 ? "on" : ""} />{imageIndex === 0 ? "Đèn tắt" : "Đèn bật"}</button>}
        {mediaMode === "model" && hasModel && <button className="light-switch" onClick={() => setLit(value => !value)} aria-pressed={lit}><i className={lit ? "on" : ""} />{lit ? "Đèn bật" : "Đèn tắt"}</button>}
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
        {hasModel && <div className="room-preview-block"><button type="button" className="room-preview-button" onClick={openRoomPreview} disabled={modelError || !modelReady}><span>✦</span>{modelError ? "3D đang được xử lý" : modelReady ? isDemoModel ? "Ướm khối mẫu 20 cm" : "Ướm đèn trong phòng" : "Đang chuẩn bị 3D…"}<b>AR</b></button><p>{isDemoModel ? "Mở trang này trực tiếp trên điện thoại để đặt khối mẫu 20 cm bằng camera. Mac/PC chỉ hỗ trợ xoay 3D." : "Mở trực tiếp trên điện thoại hỗ trợ AR để đặt đèn bằng camera. Mac/PC chỉ hỗ trợ xoay 3D."}</p>{arMessage && <p className="ar-message" aria-live="polite">{arMessage}</p>}</div>}
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
