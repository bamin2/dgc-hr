#!/usr/bin/env node
// One-shot migration: replace hard-coded Tailwind palette colors with semantic tokens.
// Deleted after successful run. See .lovable/plan.md for the mapping rationale.

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOTS = ["src/components", "src/pages"];
const UI_ALLOWLIST = new Set(["src/components/ui/toast.tsx"]);

// hue families
const HUE = {
  success: ["emerald", "green"],
  destructive: ["red", "rose"],
  warning: ["amber", "yellow", "orange"],
  info: ["blue", "sky", "cyan", "teal", "indigo", "violet", "purple"],
  accent: ["pink", "fuchsia"],
  neutral: ["slate", "zinc", "gray", "neutral", "stone"],
};

// which tokens have a "-bg" variant defined
const HAS_BG_TOKEN = new Set(["success", "destructive", "warning"]);

// neutral mapping: text -> muted-foreground, bg -> muted, border -> border
function neutralReplacement(prop) {
  if (prop === "text") return "text-muted-foreground";
  if (prop === "bg") return "bg-muted";
  if (prop === "border") return "border-border";
  if (prop === "ring") return "ring-border";
  if (prop === "divide") return "divide-border";
  if (prop === "fill") return "fill-muted-foreground";
  if (prop === "stroke") return "stroke-muted-foreground";
  return null;
}

// semantic mapping for non-neutral
function semanticReplacement(prop, token, shade, opacity) {
  // text/fill/stroke/ring: always token (foreground hue), opacity preserved
  if (prop === "text" || prop === "fill" || prop === "stroke") {
    const cls = `${prop}-${token}`;
    return opacity ? `${cls}/${opacity}` : cls;
  }
  if (prop === "ring") {
    return opacity ? `ring-${token}/${opacity}` : `ring-${token}`;
  }
  if (prop === "border") {
    if (opacity) return `border-${token}/${opacity}`;
    // 200/300 -> /30, 400/500 -> /40, others token solid
    const n = parseInt(shade, 10);
    if (n <= 300) return `border-${token}/30`;
    if (n <= 500) return `border-${token}/40`;
    return `border-${token}`;
  }
  if (prop === "bg") {
    const n = parseInt(shade, 10);
    if (opacity) {
      // dark mode style /30, /20 etc -> /10 with semantic
      return `bg-${token}/10`;
    }
    if (n <= 100) {
      return HAS_BG_TOKEN.has(token) ? `bg-${token}/10` : `bg-${token}/10`;
    }
    if (n <= 200) {
      return `bg-${token}/15`;
    }
    // 300+ solid fills
    return `bg-${token}`;
  }
  // divide, outline, placeholder, caret, decoration: best effort
  return `${prop}-${token}`;
}

// Build hue->token map
const HUE_TO_TOKEN = {};
for (const [token, hues] of Object.entries(HUE)) {
  if (token === "neutral") continue;
  for (const h of hues) HUE_TO_TOKEN[h] = token;
}
const NEUTRAL_HUES = new Set(HUE.neutral);

const ALL_HUES = [
  ...Object.values(HUE).flat(),
];

const PROPS =
  "text|bg|border|ring|fill|stroke|divide|outline|placeholder|caret|decoration|from|to|via";
const HUES = ALL_HUES.join("|");

// Match: optional dark:/hover:/focus: etc prefix kept intact, then prop-hue-shade(/opacity)?
const CLASS_RE = new RegExp(
  `\\b((?:[a-z]+:)*)(${PROPS})-(${HUES})-(\\d{2,3})(?:/(\\d{1,3}))?\\b`,
  "g"
);

function mapClass(_full, variantPrefix, prop, hue, shade, opacity) {
  if (NEUTRAL_HUES.has(hue)) {
    const r = neutralReplacement(prop);
    if (!r) return _full;
    return `${variantPrefix}${r}`;
  }
  const token = HUE_TO_TOKEN[hue];
  if (!token) return _full;
  const repl = semanticReplacement(prop, token, shade, opacity);
  return `${variantPrefix}${repl}`;
}

// Strip redundant `dark:` companion when light + dark map to the same class.
// Run after the per-token replacement; collapses sequences like
// "text-success dark:text-success" -> "text-success".
function collapseDarkDuplicates(line) {
  return line.replace(
    /\b((?:text|bg|border|ring|fill|stroke|divide)-[a-z-]+(?:\/\d{1,3})?)(\s+)dark:\1\b/g,
    "$1"
  );
}

async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.isFile() && p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const report = {};
let totalReplacements = 0;

for (const root of ROOTS) {
  const files = await walk(root);
  for (const file of files) {
    const rel = file.replace(/\\/g, "/");
    // Skip ui/** unless explicitly allow-listed
    if (rel.startsWith("src/components/ui/") && !UI_ALLOWLIST.has(rel)) continue;
    const src = await fs.readFile(file, "utf8");
    let count = 0;
    let out = src.replace(CLASS_RE, (...args) => {
      const replaced = mapClass(...args);
      if (replaced !== args[0]) count++;
      return replaced;
    });
    out = collapseDarkDuplicates(out);
    if (count > 0 && out !== src) {
      await fs.writeFile(file, out, "utf8");
      report[rel] = count;
      totalReplacements += count;
    }
  }
}

await fs.writeFile(
  "scripts/palette-migration-report.json",
  JSON.stringify({ totalReplacements, files: report }, null, 2),
  "utf8"
);

console.log(
  `Replaced ${totalReplacements} occurrences across ${Object.keys(report).length} files.`
);
