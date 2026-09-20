#!/usr/bin/env node
/**
 * Public drift reports: run the Buoy CLI against well-known open-source
 * frontends and write one JSON per repo into src/data/reports/. The site
 * builds /reports/<owner>/<repo> from those files.
 *
 *   node scripts/generate-reports.mjs [owner/repo ...]   (default: REPOS below)
 *   BUOY_BIN=/path/to/bin.js to use a local CLI build instead of npx.
 */
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const OUT_DIR = new URL("../src/data/reports/", import.meta.url);
const BUOY = process.env.BUOY_BIN ? ["node", [process.env.BUOY_BIN]] : ["npx", ["-y", "@buoy-design/cli@latest"]];

// Product codebases people know, not component libraries (those score high and prove little).
const REPOS = [
  "calcom/cal.com", "supabase/supabase", "dubinc/dub", "novuhq/novu", "midday-ai/midday",
  "twentyhq/twenty", "formbricks/formbricks", "documenso/documenso", "makeplane/plane",
  "hoppscotch/hoppscotch", "excalidraw/excalidraw", "plausible/analytics", "umami-software/umami",
  "outline/outline", "n8n-io/n8n", "TryGhost/Ghost", "posthog/posthog", "langfuse/langfuse",
  "triggerdotdev/trigger.dev", "unkeyed/unkey", "vercel/next.js", "shadcn-ui/ui",
];

async function buoy(cwd, args) {
  const [cmd, base] = BUOY;
  const { stdout } = await run(cmd, [...base, ...args], { cwd, maxBuffer: 256 * 1024 * 1024, env: { ...process.env, BUOY_TELEMETRY: "0", CI: "1" } });
  return JSON.parse(stdout);
}

async function gh(path) {
  const { stdout } = await run("gh", ["api", path]);
  return JSON.parse(stdout);
}

function topValues(drifts, kind) {
  // hardcoded-value drifts list "prop: value (line N)" per affected file; count the values.
  const counts = new Map();
  for (const d of drifts) {
    if (d.type !== "hardcoded-value" || !d.id.endsWith(`:${kind}`)) continue;
    for (const entry of d.details?.affectedFiles ?? []) {
      const m = /:\s*([^()]+?)\s*\(line/.exec(entry);
      if (!m) continue;
      const v = m[1].trim();
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([value, count]) => ({ value, count }));
}

function worstFiles(drifts) {
  const counts = new Map();
  for (const d of drifts) {
    if (d.type !== "hardcoded-value") continue;
    const file = d.source?.location?.split(":")[0];
    if (!file) continue;
    counts.set(file, (counts.get(file) ?? 0) + (d.details?.affectedFiles?.length ?? 1));
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([file, count]) => ({ file, count }));
}

function samples(drifts) {
  return drifts
    .filter((d) => d.type === "hardcoded-value" && d.details?.affectedFiles?.length)
    .slice(0, 12)
    .map((d) => ({
      component: d.source.entityName,
      location: d.source.location,
      entries: d.details.affectedFiles.slice(0, 3),
    }));
}

async function report(fullName) {
  const [owner, name] = fullName.split("/");
  const meta = await gh(`repos/${fullName}`);
  const dir = await mkdtemp(join(tmpdir(), "buoy-report-"));
  const started = Date.now();
  try {
    await run("git", ["clone", "--depth", "1", "--branch", meta.default_branch, "--single-branch", `https://github.com/${fullName}.git`, dir], { maxBuffer: 64 * 1024 * 1024 });
    const sha = (await run("git", ["rev-parse", "HEAD"], { cwd: dir })).stdout.trim();
    const health = await buoy(dir, ["show", "health", "--json"]);
    let drift = { drifts: [], summary: { total: 0, critical: 0, warning: 0, info: 0 } };
    try {
      drift = await buoy(dir, ["drift", "check", "--json", "--fail-on", "none"]);
    } catch (error) {
      // drift check exits 1 when it finds drift; the JSON is still on stdout.
      if (error.stdout) drift = JSON.parse(error.stdout);
      else throw error;
    }
    const byType = {};
    for (const d of drift.drifts) byType[d.type] = (byType[d.type] ?? 0) + 1;
    const out = {
      repo: fullName, owner, name,
      description: meta.description, stars: meta.stargazers_count, homepage: meta.homepage, language: meta.language,
      defaultBranch: meta.default_branch, commit: sha,
      generatedAt: new Date().toISOString(),
      cliVersion: process.env.BUOY_BIN ? "local" : "latest",
      score: health.score, tier: health.tier, pillars: health.pillars, metrics: health.metrics, suggestions: health.suggestions,
      driftSummary: drift.summary, driftByType: byType,
      topColors: topValues(drift.drifts, "color"),
      topSpacing: topValues(drift.drifts, "spacing"),
      worstFiles: worstFiles(drift.drifts),
      samples: samples(drift.drifts),
      scanSeconds: Math.round((Date.now() - started) / 1000),
    };
    await writeFile(new URL(`${owner}__${name}.json`, OUT_DIR), JSON.stringify(out, null, 2) + "\n");
    console.log(`${fullName}: score ${out.score} (${out.tier}), ${out.metrics.hardcodedValueCount} hardcoded, ${out.scanSeconds}s`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : REPOS;
for (const fullName of targets) {
  try {
    await report(fullName);
  } catch (error) {
    console.error(`${fullName}: FAILED ${error.message?.split("\n")[0]}`);
  }
}
