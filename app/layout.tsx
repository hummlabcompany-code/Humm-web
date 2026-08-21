import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import "./nav.css";
import "./home-shopify.css";
import "./accessibility.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://humm-store.customkeyrambitvn.chatgpt.site"),
  title: { default: "humm. — Đèn cho những căn phòng vui hơn", template: "%s | humm." },
  description: "Đèn in 3D đầy màu sắc, làm chậm nhịp sống và đánh thức inner child.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "vi_VN", url: "/", siteName: "humm.", title: "humm. — Đèn cho những căn phòng vui hơn", description: "Đèn in 3D đầy màu sắc, làm chậm nhịp sống và đánh thức inner child." },
  twitter: { card: "summary_large_image", title: "humm. — Đèn cho những căn phòng vui hơn", description: "Đèn in 3D đầy màu sắc, làm chậm nhịp sống và đánh thức inner child." },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
