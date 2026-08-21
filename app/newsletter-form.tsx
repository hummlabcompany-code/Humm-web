"use client";
import { FormEvent, useState } from "react";
export default function NewsletterForm() {
  const [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const formElement = event.currentTarget; setBusy(true); setNotice(""); const form = new FormData(formElement); try { const response = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email"), website: form.get("website") }) }); const data = await response.json() as { message?: string }; setNotice(data.message || (response.ok ? "Hẹn gặp bạn trong hộp thư nhé ✿" : "Chưa thể đăng ký lúc này.")); if (response.ok) formElement.reset(); } catch { setNotice("Chưa thể đăng ký lúc này. Bạn thử lại nhé."); } finally { setBusy(false); } }
  return <form onSubmit={submit}>
    <label htmlFor="email">Email của bạn</label>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
    <div><input id="email" name="email" type="email" autoComplete="email" placeholder="hello@you.com" aria-describedby="newsletter-notice" required /><button type="submit" disabled={busy}>{busy ? "Đang gửi…" : "Đăng ký →"}</button></div>
    <p id="newsletter-notice" className="newsletter-notice" aria-live="polite">{notice}</p>
  </form>;
}
