import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

await page.setContent(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <style>
        *{box-sizing:border-box}
        body{margin:0;min-height:100vh;display:grid;place-items:center;overflow:hidden;background:
          radial-gradient(circle at 15% 20%,rgba(180,132,215,.32),transparent 28%),
          radial-gradient(circle at 85% 80%,rgba(235,181,102,.22),transparent 30%),
          linear-gradient(135deg,#25152f 0%,#45235a 52%,#2b1736 100%);
          color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}
        body:before,body:after{content:"";position:absolute;border:1px solid rgba(255,255,255,.11);border-radius:50%}
        body:before{width:620px;height:620px;right:-180px;top:-280px}
        body:after{width:470px;height:470px;left:-190px;bottom:-260px}
        .wrap{width:min(1120px,82vw);position:relative;z-index:2}
        .brand{display:flex;align-items:center;gap:18px;margin-bottom:82px;font-size:27px;font-weight:800;letter-spacing:-.5px}
        .mark{display:grid;place-items:center;width:62px;height:62px;border-radius:19px;background:linear-gradient(145deg,#a76bd0,#8150ad);box-shadow:0 18px 50px rgba(11,4,18,.38);font-size:33px}
        .brand small{display:block;margin-top:4px;color:#d8c9e0;font-size:11px;letter-spacing:3px;text-transform:uppercase}
        .eyebrow{margin:0 0 20px;color:#e4c878;font-size:14px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase}
        h1{max-width:1050px;margin:0;font-size:67px;line-height:1.04;letter-spacing:-3.3px}
        p{max-width:900px;margin:28px 0 0;color:#ded1e4;font-size:23px;line-height:1.55}
        .badge{display:inline-flex;align-items:center;gap:10px;margin-top:42px;padding:12px 18px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(255,255,255,.08);font-size:14px;font-weight:700;color:#f7f1f9}
        .badge:before{content:"";width:9px;height:9px;border-radius:50%;background:#62d4a4;box-shadow:0 0 18px #62d4a4}
      </style>
    </head>
    <body>
      <main class="wrap">
        <div class="brand"><span class="mark">✦</span><span>Pottersville<small>School portal</small></span></div>
        <div class="eyebrow">Pottersville school portal</div>
        <h1>Ready for a smarter, more connected school experience?</h1>
        <p>Explore the live demonstration, test all three role-based workspaces, and reach out to schedule a guided product conversation.</p>
        <span class="badge">pottersville-school-demo.netlify.app</span>
      </main>
    </body>
  </html>`);

const output = path.join(process.cwd(), "artifacts", "demo-video", "outro-card.png");
await page.screenshot({ path: output, type: "png" });
await browser.close();
console.log(output);
