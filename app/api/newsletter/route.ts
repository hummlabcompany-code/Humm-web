import { env } from "cloudflare:workers";
export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 2048) return Response.json({ message: "Yêu cầu không hợp lệ." }, { status: 413 });
    const body = await request.json() as { email?: unknown; website?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (typeof body.website === "string" && body.website.trim()) return Response.json({ message: "Hẹn gặp bạn trong hộp thư nhé ✿" }, { status: 201 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return Response.json({ message: "Email chưa hợp lệ." }, { status: 400 });
    const db = env.DB;
    await db.batch([db.prepare("CREATE TABLE IF NOT EXISTS newsletter_subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, source TEXT NOT NULL DEFAULT 'homepage', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"), db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email)")]);
    await db.prepare("INSERT OR IGNORE INTO newsletter_subscribers (email, source) VALUES (?, 'homepage')").bind(email).run();
    return Response.json({ message: "Hẹn gặp bạn trong hộp thư nhé ✿" }, { status: 201 });
  } catch { return Response.json({ message: "Chưa thể đăng ký lúc này." }, { status: 500 }); }
}
