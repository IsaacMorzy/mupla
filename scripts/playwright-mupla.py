"""Smoke-test the production dist/ with Playwright (driven via uvx).

Hits every public route, captures a full-page screenshot, and records any
client-side console errors. Exits non-zero if any route returns a
non-2xx status, fails to render a title, or logs an error.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, ConsoleMessage

BASE = "http://127.0.0.1:4321"
OUT = Path("/tmp/mupla-evidence")
OUT.mkdir(parents=True, exist_ok=True)

# (slug, screenshot-name, expected-title-fragment)
ROUTES: list[tuple[str, str, str]] = [
    ("/",                                                       "home",            "mupla"),
    ("/about",                                                  "about",           "About"),
    ("/programs",                                               "programs",        "programs"),
    ("/donate",                                                 "donate",          "Donate"),
    ("/contact",                                                "contact",         "Contact"),
    ("/get-involved",                                           "get-involved",    "involved"),
    ("/faq",                                                    "faq",             "FAQ"),
    ("/team",                                                   "team",            "team"),
    ("/terms",                                                  "terms",           "Terms"),
    ("/privacy",                                                "privacy",         "Privacy"),
    ("/blog",                                                   "blog-index",      "blog"),
    ("/blog/welcoming-the-month-of-ramadan",                    "blog-ramadan",    "Ramadan"),
    ("/blog/what-zakat-means-in-our-community",                 "blog-zakat",      "Zakat"),
    ("/blog/search",                                            "blog-search",     "Search"),
    ("/events",                                                 "events-index",    "Events"),
    ("/events/parenting-workshop",                              "event-parenting", "Parenting"),
    ("/events/food-pantry-saturday",                            "event-pantry",    "Food Pantry"),
    ("/events/ramadan-community-ifftar",                        "event-ramadan",   "Iftar"),
    ("/events/annual-fundraising-gala",                         "event-gala",      "Gala"),
    ("/rss.xml",                                                "rss",             ""),
]

results: list[dict] = []


def run() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        for path, name, title_frag in ROUTES:
            url = BASE + path
            page_errors: list[str] = []
            console_errors: list[str] = []
            page = ctx.new_page()
            page.on("pageerror", lambda exc, e=page_errors: e.append(f"pageerror: {exc}"))
            def on_console(msg: ConsoleMessage, errs=console_errors) -> None:
                if msg.type == "error":
                    errs.append(msg.text)
            page.on("console", on_console)
            try:
                resp = page.goto(url, wait_until="domcontentloaded", timeout=20_000)
                status = resp.status if resp else 0
                title = page.title()
                if "rss" in name:
                    body_text = page.evaluate("() => document.body ? document.body.innerText : ''")
                    (OUT / f"{name}.txt").write_text(body_text)
                    screenshot_path: str | None = None
                else:
                    screenshot_path = str(OUT / f"{name}.png")
                    page.screenshot(path=screenshot_path, full_page=True)
                title_ok = (not title_frag) or (title_frag.lower() in title.lower())
                ok = 200 <= status < 400 and title_ok and not page_errors
                results.append({
                    "url": url,
                    "status": status,
                    "title": title,
                    "console_errors": console_errors,
                    "page_errors": page_errors,
                    "screenshot": screenshot_path,
                    "ok": bool(ok),
                })
            except Exception as exc:
                results.append({"url": url, "status": 0, "error": str(exc), "ok": False})
            finally:
                page.close()
        ctx.close()
        browser.close()

    (OUT / "summary.json").write_text(json.dumps(results, indent=2))
    failed = [r for r in results if not r.get("ok")]
    print(f"Routes tested: {len(results)}  Failed: {len(failed)}")
    for r in results:
        flag = "OK" if r.get("ok") else "FAIL"
        title = r.get("title", "(no title)")
        status = r.get("status", "?")
        errs = (r.get("console_errors") or r.get("page_errors") or r.get("error")) or []
        extras = f"  errs={errs[:2]}" if errs else ""
        print(f"  [{flag}] {status:>3}  {title[:50]:<50}  {r['url']}{extras}")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(run())
