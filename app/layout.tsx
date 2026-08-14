import type { Metadata } from "next";
import "./globals.css";
import "./nav.css";

export const metadata: Metadata = {
  title: "humm. — Đèn cho những căn phòng vui hơn",
  description: "Đèn in 3D đầy màu sắc, làm chậm nhịp sống và đánh thức inner child.",
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
