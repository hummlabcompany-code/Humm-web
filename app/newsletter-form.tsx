"use client";
import { FormEvent, useState } from "react";
export default function NewsletterForm() {
  const [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setNotice(""); const form = new FormData(event.currentTarget); try { const response = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email") }) }); const data = await response.json() as { message?: string }; setNotice(data.message || (response.ok ? "Hẹn gặp bạn trong hộp thư nhé ✿" : "Chưa thể đăng ký lúc này.")); if (response.ok) event.currentTarget.reset(); } catch { setNotice("Chưa thể đăng ký lúc này. Bạn thử lại nhé."); } finally { setBusy(false); } }
  return <form onSubmit={submit}><label htmlFor="email">Email của bạn</label><div><input id="email" name="email" type="email" autoComplete="email" placeholder="hello@you.com" required /><button type="submit" disabled={busy}>{busy ? "Đang gửi…" : "Đăng ký →"}</button></div><p className="newsletter-notice" aria-live="polite">{notice}</p></form>;
}
