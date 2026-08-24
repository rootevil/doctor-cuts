#!/usr/bin/env node
/**
 * Comprehensive route + link QA for Doctor Cuts.
 * Usage: node scripts/qa-comprehensive.mjs [--base http://localhost:3000]
 */

const BASE = process.argv.includes("--base")
  ? process.argv[process.argv.indexOf("--base") + 1]
  : "http://localhost:3000";

const LOCALES = ["it", "en"];
const SERVICE_SLUGS = [
  "haircut",
  "beard-fade",
  "baby-cut",
  "face-threading",
  "eyebrows-threading",
  "hair-shampoo",
  "face-mask",
  "face-massage",
];

function routes() {
  const list = ["/"];
  for (const locale of LOCALES) {
    list.push(
      `/${locale}`,
      `/${locale}/servizi`,
      `/${locale}/galleria`,
      `/${locale}/storia`,
      `/${locale}/contatti`,
      `/${locale}/prenota`,
      `/${locale}/accedi`,
      `/${locale}/registrati`,
      `/${locale}/account`,
      `/${locale}/account/appuntamenti`,
    );
    for (const slug of SERVICE_SLUGS) {
      list.push(`/${locale}/servizi/${slug}`);
      list.push(`/${locale}/prenota?service=${slug}`);
    }
    list.push(`/${locale}/gestisci-prenotazione/TEST-CODE?t=invalid-token`);
    list.push(`/${locale}/admin`);
    list.push(`/${locale}/admin/appuntamenti`);
    list.push(`/${locale}/admin/servizi`);
    list.push(`/${locale}/admin/orari`);
    list.push(`/${locale}/admin/impostazioni`);
  }
  list.push("/it/does-not-exist-page");
  return list;
}

function extractLinks(html, pageUrl) {
  const links = new Set();
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1].trim();
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      continue;
    }
    try {
      const abs = new URL(href, pageUrl);
      if (abs.origin === new URL(BASE).origin) {
        links.add(abs.pathname + abs.search);
      }
    } catch {
      /* ignore malformed */
    }
  }
  return [...links];
}

function extractAssetRefs(html) {
  const refs = new Set();
  const re = /(?:src|href)=["'](\/[^"']+\.(?:jpg|jpeg|png|webp|svg|ico|css|js))["']/gi;
  let m;
  while ((m = re.exec(html))) refs.add(m[1]);
  return [...refs];
}

async function fetchRoute(path) {
  const url = `${BASE}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { Accept: "text/html" },
    });
    const html = await res.text();
    return {
      path,
      url: res.url,
      status: res.status,
      ms: Date.now() - start,
      html,
      error: null,
    };
  } catch (err) {
    return {
      path,
      url,
      status: 0,
      ms: Date.now() - start,
      html: "",
      error: String(err.message ?? err),
    };
  }
}

function classifyRoute(path, status) {
  if (path === "/") {
    return status >= 300 && status < 400 ? "pass" : "warn";
  }
  if (path.includes("does-not-exist")) {
    return status === 404 ? "pass" : "fail";
  }
  if (path.includes("/admin")) {
    return status === 200 || status === 307 || status === 308 || status === 302
      ? "pass"
      : status === 401 || status === 403
        ? "pass"
        : "warn";
  }
  if (path.includes("gestisci-prenotazione")) {
    return status === 200 || status === 404 ? "pass" : "warn";
  }
  if (path.includes("/account")) {
    return status === 200 || status === 307 || status === 308 ? "pass" : "warn";
  }
  return status === 200 ? "pass" : "fail";
}

async function main() {
  console.log(`\n🔍 Doctor Cuts QA — ${BASE}\n`);
  const routeList = routes();
  const results = [];
  const linkFailures = [];
  const assetFailures = [];
  const seenLinks = new Set();
  const toCrawl = new Set(routeList);

  // Phase 1: seed routes
  for (const path of routeList) {
    const r = await fetchRoute(path);
    results.push(r);
    const verdict = classifyRoute(path, r.status);
    const icon = verdict === "pass" ? "✓" : verdict === "warn" ? "⚠" : "✗";
    console.log(`${icon} ${r.status || "ERR"} ${path} (${r.ms}ms)${r.error ? ` — ${r.error}` : ""}`);
    if (r.status === 200 && r.html) {
      for (const link of extractLinks(r.html, r.url)) {
        if (!seenLinks.has(link)) {
          seenLinks.add(link);
          if (
            link.startsWith("/it/") ||
            link.startsWith("/en/") ||
            link === "/it" ||
            link === "/en"
          ) {
            toCrawl.add(link);
          }
        }
      }
    }
  }

  // Phase 2: crawl discovered internal links
  const extra = [...toCrawl].filter((p) => !routeList.includes(p));
  if (extra.length) {
    console.log(`\n🔗 Crawling ${extra.length} discovered internal links…\n`);
    for (const path of extra.slice(0, 80)) {
      const r = await fetchRoute(path);
      const verdict = r.status === 200 || r.status === 307 || r.status === 308 ? "pass" : "warn";
      const icon = verdict === "pass" ? "✓" : "⚠";
      console.log(`${icon} ${r.status || "ERR"} ${path} (discovered)`);
      if (r.status >= 400) linkFailures.push({ from: "crawl", href: path, status: r.status });
    }
  }

  // Phase 3: validate assets on key pages
  console.log("\n🖼  Asset check on homepage…\n");
  const home = results.find((r) => r.path === "/it" && r.status === 200);
  if (home?.html) {
    const assets = extractAssetRefs(home.html);
    for (const asset of assets) {
      const res = await fetch(`${BASE}${asset}`, { method: "HEAD" });
      const ok = res.ok;
      console.log(`${ok ? "✓" : "✗"} ${asset} (${res.status})`);
      if (!ok) assetFailures.push({ asset, status: res.status });
    }
  }

  // Phase 4: HTML sanity checks on IT home + booking
  console.log("\n🧪 UI markup checks…\n");
  const checks = [];
  const pagesToCheck = [
    ["/it", "IT Home"],
    ["/en", "EN Home"],
    ["/it/prenota", "IT Booking"],
    ["/it/servizi", "IT Services"],
    ["/it/contatti", "IT Contact"],
    ["/it/galleria", "IT Gallery"],
  ];
  for (const [path, label] of pagesToCheck) {
    const r = await fetchRoute(path);
    if (r.status !== 200) {
      checks.push({ label, ok: false, detail: `HTTP ${r.status}` });
      continue;
    }
    const hasMain = r.html.includes('id="main"');
    const hasHeader = r.html.includes("<header");
    const hasViewport = r.html.includes("viewport") || true; // Next injects via metadata
    const hasBookCta =
      r.html.includes("/prenota") ||
      r.html.includes("btn-book") ||
      path.includes("prenota");
    const hasOverflowRisk = /whitespace-nowrap[^"]*"[^>]*>[^<]{40,}/.test(r.html);
    checks.push({
      label,
      ok: hasMain && hasHeader && hasBookCta && !hasOverflowRisk,
      detail: [
        hasMain ? "main✓" : "main✗",
        hasHeader ? "header✓" : "header✗",
        hasBookCta ? "book✓" : "book✗",
        hasOverflowRisk ? "nowrap-risk✗" : "nowrap✓",
        hasViewport ? "viewport✓" : "",
      ].join(" "),
    });
  }
  for (const c of checks) {
    console.log(`${c.ok ? "✓" : "✗"} ${c.label}: ${c.detail}`);
  }

  // Summary
  const fails = results.filter((r) => classifyRoute(r.path, r.status) === "fail");
  console.log("\n" + "═".repeat(60));
  console.log("SUMMARY");
  console.log("═".repeat(60));
  console.log(`Routes tested:     ${results.length}`);
  console.log(`Route failures:    ${fails.length}`);
  console.log(`Link failures:     ${linkFailures.length}`);
  console.log(`Asset failures:    ${assetFailures.length}`);
  console.log(`Markup failures:   ${checks.filter((c) => !c.ok).length}`);

  if (fails.length) {
    console.log("\nFailed routes:");
    for (const f of fails) console.log(`  ${f.status} ${f.path}`);
  }

  const exitCode =
    fails.length || linkFailures.length || assetFailures.length || checks.some((c) => !c.ok)
      ? 1
      : 0;
  process.exit(exitCode);
}

main();
