import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import "./nav.css";
import "./home-shopify.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://humm-store.customkeyrambitvn.chatgpt.site"),
  title: { default: "humm. — Đèn cho những căn phòng vui hơn", template: "%s | humm." },
  description: "Đèn in 3D đầy màu sắc, làm chậm nhịp sống và đánh thức inner child.",
  openGraph: { type: "website", locale: "vi_VN", siteName: "humm.", title: "humm. — Đèn cho những căn phòng vui hơn", description: "Đèn in 3D đầy màu sắc, làm chậm nhịp sống và đánh thức inner child." },
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
