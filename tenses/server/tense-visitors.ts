// Pengunjung Purrfect Tense · Supabase Edge Function (Deno)
// Nama function di Supabase: tense-visitors
// Butuh tabel dari visitors.sql dan secret OWNER_PASS (sama dengan Grammar Detector).
// Aksi (POST JSON { action, vid, ... }):
//   visit    → catat satu kunjungan (+ progres terbaru)
//   name     → simpan / ganti nama panggilan
//   check    → +1 cek Detector
//   progress → perbarui roda gigi, lantai, skor terbaik
//   list     → (pemilik saja) daftar pengunjung + ringkasan
//   delete   → (pemilik saja) hapus satu pengunjung
// Kalau header x-owner-pass cocok, aksi pencatatan diabaikan: pemilik tidak ikut terhitung.

import postgres from "npm:postgres@3.4.5";

const ALLOWED_ORIGINS = ["https://157starry.github.io", "http://localhost:8000", "http://127.0.0.1:8000"];
const NEW_PER_IP_DAY = 30; // ID browser baru per jaringan per hari
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DB_URL = Deno.env.get("SUPABASE_DB_URL") ?? "";
const sql = DB_URL ? postgres(DB_URL, { prepare: false, max: 1, idle_timeout: 20 }) : null;

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-owner-pass",
    "Vary": "Origin",
  };
}
function reply(status: number, body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(origin), "Content-Type": "application/json" } });
}
async function sha(s: string): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const int = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
function cleanName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  return s || null;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return reply(405, { error: "method" }, origin);
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return reply(403, { error: "origin" }, origin);
  if (!sql) return reply(503, { error: "not_configured" }, origin);

  let body: any;
  try { body = await req.json(); } catch { return reply(400, { error: "bad_json" }, origin); }
  const action = String(body?.action || "");

  const ownerPass = Deno.env.get("OWNER_PASS") ?? "";
  const sent = req.headers.get("x-owner-pass") ?? "";
  const owner = !!sent && !!ownerPass && (await sha(sent)) === (await sha(ownerPass));

  try {
    /* ---------- aksi pemilik ---------- */
    if (action === "list" || action === "delete") {
      if (!owner) return reply(401, { error: "bad_owner" }, origin);
      if (action === "delete") {
        if (!UUID.test(String(body?.vid))) return reply(400, { error: "vid" }, origin);
        await sql`delete from public.tense_visitors where vid = ${body.vid}`;
        return reply(200, { ok: true }, origin);
      }
      const rows = await sql`
        select vid, no, name, first_seen, last_seen, visits, checks, gears, floors, best
        from public.tense_visitors order by last_seen desc limit 1000`;
      const [t] = await sql`
        select count(*)::int as visitors,
               count(name)::int as named,
               coalesce(sum(visits), 0)::int as visits,
               coalesce(sum(checks), 0)::int as checks,
               count(*) filter (where last_seen > now() - interval '7 days')::int as active7,
               count(*) filter (where first_seen > now() - interval '1 day')::int as new24
        from public.tense_visitors`;
      return reply(200, { ok: true, totals: t, rows }, origin);
    }

    /* ---------- aksi pencatatan ---------- */
    if (owner) return reply(200, { ok: true, owner: true }, origin); // pemilik tidak dihitung
    const vid = String(body?.vid || "");
    if (!UUID.test(vid)) return reply(400, { error: "vid" }, origin);
    const gears = int(body?.gears, 16), floors = int(body?.floors, 5), best = int(body?.best, 100000);

    // ID baru? batasi per jaringan per hari supaya tidak bisa dibanjiri bot
    const [exists] = await sql`select 1 as x from public.tense_visitors where vid = ${vid}`;
    if (!exists) {
      const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
      const day = new Date().toISOString().slice(0, 10);
      const iph = (await sha("jk-visitor|" + day + "|" + ip)).slice(0, 24);
      const [c] = await sql`
        insert into public.tense_visitor_ip (day, ip, n) values (current_date, ${iph}, 1)
        on conflict (day, ip) do update set n = public.tense_visitor_ip.n + 1
        returning n`;
      await sql`delete from public.tense_visitor_ip where day < current_date - 2`;
      if (c.n > NEW_PER_IP_DAY) return reply(429, { error: "limit" }, origin);
    }

    if (action === "visit") {
      const name = cleanName(body?.name);
      const [r] = await sql`
        insert into public.tense_visitors (vid, name, visits, gears, floors, best)
        values (${vid}, ${name}, 1, ${gears}, ${floors}, ${best})
        on conflict (vid) do update set
          visits = public.tense_visitors.visits + 1,
          last_seen = now(),
          name = coalesce(public.tense_visitors.name, excluded.name),
          gears = greatest(public.tense_visitors.gears, excluded.gears),
          floors = greatest(public.tense_visitors.floors, excluded.floors),
          best = greatest(public.tense_visitors.best, excluded.best)
        returning no, visits`;
      return reply(200, { ok: true, no: r.no, visits: r.visits }, origin);
    }
    if (action === "name") {
      const name = cleanName(body?.name);
      await sql`
        insert into public.tense_visitors (vid, name, visits) values (${vid}, ${name}, 1)
        on conflict (vid) do update set name = excluded.name, last_seen = now()`;
      return reply(200, { ok: true }, origin);
    }
    if (action === "check") {
      await sql`
        insert into public.tense_visitors (vid, checks, visits) values (${vid}, 1, 1)
        on conflict (vid) do update set checks = public.tense_visitors.checks + 1, last_seen = now()`;
      return reply(200, { ok: true }, origin);
    }
    if (action === "progress") {
      await sql`
        insert into public.tense_visitors (vid, visits, gears, floors, best) values (${vid}, 1, ${gears}, ${floors}, ${best})
        on conflict (vid) do update set
          last_seen = now(),
          gears = greatest(public.tense_visitors.gears, excluded.gears),
          floors = greatest(public.tense_visitors.floors, excluded.floors),
          best = greatest(public.tense_visitors.best, excluded.best)`;
      return reply(200, { ok: true }, origin);
    }
    return reply(400, { error: "action" }, origin);
  } catch (e) {
    console.error("tense-visitors", action, e);
    return reply(500, { error: "db" }, origin);
  }
});
