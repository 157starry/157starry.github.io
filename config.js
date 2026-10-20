// ============================================================
//  s(T☆R)light · settings
//  Uses the same Supabase project (and the same Keeper login) as Quefory.
// ============================================================
window.STARLIGHT = {
  supabaseUrl: "https://ulnmlwvehuofukpmsgyl.supabase.co",
  supabaseAnonKey: "sb_publishable_A2yYd8nRwg33aTVIXoMmXw_dQ-hszir",

  // Text you can change any time
  title: "s(T☆R)light",
  subtitle: "finding æquanimitas in a princess-coded constellation",
  queforyUrl: "https://157starry.github.io/quefory/",

  // Each star on the home sky: x/y are % of the sky (0–100)
  stars: [
    { key: "lecto",       label: "lect(o)",     desc: "things I learn",  href: "lecto.html",       x: 26, y: 34 },
    { key: "florilegium", label: "Florilegium", desc: "words I keep",    href: "florilegium.html", x: 68, y: 38.5 },
    { key: "nocturnes",   label: "Nocturnes",   desc: "songs on repeat", href: "nocturnes.html",   x: 80, y: 57.5 },
    { key: "lieux",       label: "Lieux",       desc: "places I loved",  href: "lieux.html",       x: 51, y: 70 },
    { key: "lab",         label: "Starry Lab",  desc: "things I built",  href: "lab.html",         x: 21, y: 58.5 },
  ],
};
