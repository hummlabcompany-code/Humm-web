import {CartProvider} from "./cart";
import "./shop.css";
import "./commerce.css";
import "./trust.css";
export default function ShopLayout({children}:{children:React.ReactNode}){return <CartProvider>{children}</CartProvider>}
