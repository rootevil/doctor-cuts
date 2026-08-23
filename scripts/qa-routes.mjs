#!/usr/bin/env node
/** Smoke-test every route the app exposes. Run while `npm run dev` is up. */

const base = process.argv[2] ?? "http://localhost:3000";
const slugs = [
  "haircut",
  "beard-fade",
  "face-mask",
  "face-massage",
];

const paths = [
  "/",
  "/robots.txt",
  "/sitemap.xml",
  ...["it", "en"].flatMap((l) => [
    `/${l}`,
    `/${l}/servizi`,
    ...slugs.map((s) => `/${l}/servizi/${s}`),
    `/${l}/galleria`,
    `/${l}/storia`,
    `/${l}/contatti`,
    `/${l}/prenota`,
    `/${l}/accedi`,
    `/${l}/registrati`,
    `/${l}/account`,
    `/${l}/account/appuntamenti`,
    `/${l}/admin`,
    `/${l}/admin/appuntamenti`,
    `/${l}/admin/servizi`,
    `/${l}/admin/servizi/nuovo`,
    `/${l}/admin/orari`,
    `/${l}/admin/clienti`,
    `/${l}/admin/galleria`,
    `/${l}/admin/recensioni`,
    `/${l}/admin/impostazioni`,
    `/${l}/gestisci-prenotazione/DC-TEST?t=invalid`,
    `/${l}/no-such-page`,
  ]),
];

const expect = {
  redirect: new Set([
    "/",
    "/it/account",
    "/en/account",
    "/it/account/appuntamenti",
    "/en/account/appuntamenti",
    "/it/admin",
    "/en/admin",
    "/it/admin/appuntamenti",
    "/en/admin/appuntamenti",
    "/it/admin/servizi",
    "/en/admin/servizi",
    "/it/admin/servizi/nuovo",
    "/en/admin/servizi/nuovo",
    "/it/admin/orari",
    "/en/admin/orari",
    "/it/admin/clienti",
    "/en/admin/clienti",
    "/it/admin/galleria",
    "/en/admin/galleria",
    "/it/admin/recensioni",
    "/en/admin/recensioni",
    "/it/admin/impostazioni",
    "/en/admin/impostazioni",
  ]),
  notFound: new Set(["/it/no-such-page", "/en/no-such-page"]),
};

const results = [];
for (const path of paths) {
  try {
    const res = await fetch(`${base}${path}`, { redirect: "manual" });
    const code = res.status;
    const ok = expect.redirect.has(path)
      ? code >= 300 && code < 400
      : expect.notFound.has(path)
        ? code === 404
        : code >= 200 && code < 400;
    results.push({ path, code, ok });
    const mark = ok ? "✔" : "✘";
    console.log(`${mark} ${code} ${path}`);
  } catch (err) {
    results.push({ path, code: 0, ok: false, err: String(err) });
    console.log(`✘ ERR ${path} ${err}`);
  }
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\n${failed.length} route(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${results.length} routes OK`);
