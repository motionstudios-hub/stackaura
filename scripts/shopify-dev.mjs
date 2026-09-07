import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_PORT = 3000;
const FRONTEND_HOST = process.env.FRONTEND_HOST || "127.0.0.1";
const FRONTEND_ORIGIN = `http://${FRONTEND_HOST}:${FRONTEND_PORT}`;
const LOCALHOST_ORIGIN = `http://localhost:${FRONTEND_PORT}`;
const DEFAULT_BACKEND_ORIGIN = "http://127.0.0.1:3001";
const FRONTEND_ENV_FILES = [".env.local", ".env"];
const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");
const nextDevCommandFragment = `${repoRoot}/node_modules/.bin/next dev`;

function run(command, args) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function runOptional(command, args) {
  try {
    return run(command, args);
  } catch (error) {
    const stderr = error instanceof Error && "stderr" in error ? String(error.stderr ?? "") : "";
    if (command === "lsof" && /No such file or directory|not found/i.test(stderr)) {
      throw new Error("`lsof` is required for the Shopify port guard script.");
    }

    if (command === "lsof" && error && typeof error === "object" && "status" in error && error.status === 1) {
      return "";
    }

    throw error;
  }
}

function normalizeBaseUrl(value) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

function stripWrappingQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function readEnvValueFromFiles(name) {
  for (const filename of FRONTEND_ENV_FILES) {
    const fullPath = path.join(repoRoot, filename);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const contents = fs.readFileSync(fullPath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (key !== name) {
        continue;
      }

      return stripWrappingQuotes(trimmed.slice(separatorIndex + 1));
    }
  }

  return null;
}

function getConfiguredBackendBase() {
  return (
    normalizeBaseUrl(process.env.CHECKOUT_API_URL) ||
    normalizeBaseUrl(process.env.CHECKOUT_API_BASE_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL) ||
    normalizeBaseUrl(readEnvValueFromFiles("CHECKOUT_API_URL")) ||
    normalizeBaseUrl(readEnvValueFromFiles("CHECKOUT_API_BASE_URL")) ||
    normalizeBaseUrl(readEnvValueFromFiles("NEXT_PUBLIC_API_BASE")) ||
    normalizeBaseUrl(readEnvValueFromFiles("NEXT_PUBLIC_CHECKOUT_API_BASE_URL")) ||
    DEFAULT_BACKEND_ORIGIN
  );
}

function getParentPid(pid) {
  const stdout = run("ps", ["-p", String(pid), "-o", "ppid="]).trim();
  return stdout ? Number(stdout) : null;
}

function getCommand(pid) {
  return run("ps", ["-p", String(pid), "-o", "command="]).trim();
}

function getListeners(port) {
  const stdout = runOptional("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"]);
  if (!stdout.trim()) {
    return [];
  }

  return stdout
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const columns = line.trim().split(/\s+/);
      const pid = Number(columns[1]);
      const parentPid = getParentPid(pid);
      const command = getCommand(pid);
      const parentCommand = parentPid ? getCommand(parentPid) : "";
      return {
        pid,
        address: columns.at(-1) ?? "",
        command,
        parentCommand,
      };
    });
}

function getCloudflaredProcesses() {
  const stdout = run("ps", ["-axo", "pid=,command="]);

  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [pidText, ...commandParts] = line.split(/\s+/);
      return {
        pid: Number(pidText),
        command: commandParts.join(" "),
      };
    })
    .filter(({ command }) => command.includes("cloudflared tunnel --url"));
}

function describeListener(listener) {
  const details = [`pid=${listener.pid}`, listener.address, listener.command];
  if (listener.parentCommand) {
    details.push(`parent=${listener.parentCommand}`);
  }
  return details.join(" | ");
}

function isRepoNextListener(listener) {
  return listener.command.includes(nextDevCommandFragment) || listener.parentCommand.includes(nextDevCommandFragment);
}

function isShopifyCliListener(listener) {
  return listener.command.includes("shopify app dev") || listener.parentCommand.includes("shopify app dev");
}

function getPortStatus() {
  const listeners = getListeners(FRONTEND_PORT);
  const repoNextListeners = listeners.filter(isRepoNextListener);
  const shopifyCliListeners = listeners.filter(isShopifyCliListener);
  const unexpectedListeners = listeners.filter(
    (listener) => !isRepoNextListener(listener) && !isShopifyCliListener(listener),
  );

  return {
    listeners,
    repoNextListeners,
    shopifyCliListeners,
    unexpectedListeners,
  };
}

function getTunnelStatus() {
  const cloudflaredProcesses = getCloudflaredProcesses();
  return {
    localhostTunnels: cloudflaredProcesses.filter(({ command }) => command.includes(LOCALHOST_ORIGIN)),
    loopbackTunnels: cloudflaredProcesses.filter(({ command }) => command.includes(FRONTEND_ORIGIN)),
  };
}

function describeBackendHealth(backendHealth) {
  if (backendHealth.ok) {
    return `ok (${backendHealth.statusCode})`;
  }

  if (backendHealth.statusCode) {
    return `unhealthy (${backendHealth.statusCode})`;
  }

  return `unreachable (${backendHealth.errorMessage})`;
}

async function summarizeStatus() {
  const portStatus = getPortStatus();
  const tunnelStatus = getTunnelStatus();
  const backendHealth = await getBackendHealth();

  console.log(`Shopify frontend target: ${FRONTEND_ORIGIN}`);
  console.log(`Checkout API health target: ${backendHealth.url}`);

  if (portStatus.listeners.length === 0) {
    console.log("Port 3000 listeners: none");
  } else {
    console.log("Port 3000 listeners:");
    for (const listener of portStatus.listeners) {
      console.log(`- ${describeListener(listener)}`);
    }
  }

  if (tunnelStatus.loopbackTunnels.length === 0 && tunnelStatus.localhostTunnels.length === 0) {
    console.log("Cloudflared tunnels: none");
  } else {
    console.log("Cloudflared tunnels:");
    for (const process of tunnelStatus.loopbackTunnels) {
      console.log(`- ok: pid=${process.pid} | ${process.command}`);
    }
    for (const process of tunnelStatus.localhostTunnels) {
      console.log(`- fix-needed: pid=${process.pid} | ${process.command}`);
    }
  }

  console.log(`Checkout API health: ${describeBackendHealth(backendHealth)}`);

  const issues = [];
  if (portStatus.shopifyCliListeners.length > 0) {
    issues.push("`shopify app dev` is listening on port 3000 and can shadow the frontend on localhost.");
  }
  if (portStatus.unexpectedListeners.length > 0) {
    issues.push("An unexpected process is listening on port 3000.");
  }
  if (tunnelStatus.localhostTunnels.length > 0) {
    issues.push("A cloudflared tunnel is still targeting http://localhost:3000 instead of http://127.0.0.1:3000.");
  }
  if (!backendHealth.ok) {
    issues.push(
      `The checkout API is not reachable at ${backendHealth.url}. Start the backend on port 3001 or fix CHECKOUT_API_URL before using Shopify routes.`,
    );
  }

  if (issues.length === 0) {
    console.log("Status: ok");
    return true;
  }

  console.error("Status: fix needed");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  return false;
}

function ensureFrontendPortAvailableForStart() {
  const { listeners, shopifyCliListeners, unexpectedListeners } = getPortStatus();

  if (listeners.length === 0) {
    return;
  }

  const problems = [];
  if (shopifyCliListeners.length > 0) {
    problems.push("Stop `shopify app dev` before starting the frontend. It can grab port 3000 on `::1`.");
  }
  if (unexpectedListeners.length > 0) {
    problems.push("Port 3000 is already in use by a different process.");
  }
  if (listeners.some(isRepoNextListener)) {
    problems.push("The Stackaura frontend is already running on port 3000.");
  }

  throw new Error(problems.join("\n"));
}

function request(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === "https:" ? https : http;
    const req = client.get(parsed, (response) => {
      response.resume();
      resolve(response.statusCode ?? 0);
    });

    req.on("error", reject);
    req.setTimeout(2000, () => {
      req.destroy(new Error(`Timed out waiting for ${url}`));
    });
  });
}

async function getBackendHealth() {
  const url = `${getConfiguredBackendBase()}/shopify/health`;

  try {
    const statusCode = await request(url);
    return {
      url,
      statusCode,
      ok: statusCode >= 200 && statusCode < 300,
      errorMessage: null,
    };
  } catch (error) {
    return {
      url,
      statusCode: null,
      ok: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}

async function ensureFrontendReachable() {
  const { repoNextListeners, shopifyCliListeners, unexpectedListeners } = getPortStatus();
  if (shopifyCliListeners.length > 0) {
    throw new Error(
      "A `shopify app dev` process is listening on port 3000. Stop it before starting the tunnel so requests do not resolve to the wrong listener.",
    );
  }
  if (unexpectedListeners.length > 0) {
    throw new Error("Port 3000 is owned by an unexpected process. Run `npm run shopify:check` and clear it first.");
  }
  if (repoNextListeners.length === 0) {
    throw new Error("The Next frontend is not listening on port 3000 yet. Start it with `npm run dev` first.");
  }

  const statusCode = await request(`${FRONTEND_ORIGIN}/shopify`);
  if (statusCode < 200 || statusCode >= 500) {
    throw new Error(`The frontend responded with HTTP ${statusCode} at ${FRONTEND_ORIGIN}/shopify.`);
  }
}

async function ensureBackendReachable() {
  const backendHealth = await getBackendHealth();
  if (backendHealth.ok) {
    return;
  }

  throw new Error(
    `Checkout API is not reachable at ${backendHealth.url}. Start it on port 3001 or update CHECKOUT_API_URL before starting the tunnel.`,
  );
}

function ensureNoLocalhostTunnel() {
  const { localhostTunnels } = getTunnelStatus();
  if (localhostTunnels.length === 0) {
    return;
  }

  throw new Error(
    [
      "A cloudflared tunnel is already targeting http://localhost:3000.",
      "Stop it before starting the guarded tunnel so Shopify traffic always resolves to http://127.0.0.1:3000.",
    ].join("\n"),
  );
}

function spawnPassthrough(command, args) {
  const child = spawn(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

async function main() {
  const subcommand = process.argv[2] ?? "check";

  if (subcommand === "check") {
    process.exit((await summarizeStatus()) ? 0 : 1);
  }

  if (subcommand === "next") {
    ensureFrontendPortAvailableForStart();
    console.log(`Starting Next dev server on ${FRONTEND_ORIGIN}`);
    spawnPassthrough("next", ["dev", "--webpack", "--hostname", FRONTEND_HOST, "--port", String(FRONTEND_PORT)]);
    return;
  }

  if (subcommand === "tunnel") {
    ensureNoLocalhostTunnel();
    await ensureFrontendReachable();
    await ensureBackendReachable();
    console.log(`Starting cloudflared tunnel for ${FRONTEND_ORIGIN}`);
    spawnPassthrough("cloudflared", ["tunnel", "--url", FRONTEND_ORIGIN]);
    return;
  }

  throw new Error(`Unknown subcommand: ${subcommand}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
