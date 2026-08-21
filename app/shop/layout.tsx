import type {Metadata} from "next";
import {CartProvider} from "./cart";
import "./shop.css";
import "./commerce.css";
import "./trust.css";
import "./shopify.css";
import "./enhancements.css";
import "./upgrades.css";
import "../fonts.css";
export const metadata:Metadata={title:"Cửa hàng",description:"Khám phá những chiếc đèn in 3D đầy màu sắc của humm.",alternates:{canonical:"/shop"},openGraph:{url:"/shop",title:"Cửa hàng humm.",description:"Khám phá những chiếc đèn in 3D đầy màu sắc của humm."}};
export default function ShopLayout({children}:{children:React.ReactNode}){return <CartProvider>{children}</CartProvider>}
