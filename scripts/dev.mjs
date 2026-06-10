import { existsSync, watch } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");
const viteBin = join(projectRoot, "node_modules", "vite", "bin", "vite.js");
const serverScript = join(projectRoot, "scripts", "dev-server.mjs");
const distIndexHtml = join(projectRoot, "dist", "index.html");

const childEnv = {
  ...process.env,
  HOST: process.env.HOST || "0.0.0.0",
  PORT: process.env.PORT || "3000",
};

const watchRoots = [join(projectRoot, "src")];
if (existsSync(join(projectRoot, "public"))) {
  watchRoots.push(join(projectRoot, "public"));
}

const watchedFiles = new Set(
  [
    "index.html",
    "package.json",
    "postcss.config.js",
    "postcss.config.cjs",
    "tailwind.config.ts",
    "tailwind.config.js",
    "vite.config.ts",
    "vite.config.js",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
  ].map((name) => name.toLowerCase()),
);

let serverProcess = null;
let watcher = null;
let shuttingDown = false;
let buildInProgress = false;
let rebuildQueued = false;
let rebuildTimer = null;

function runViteBuild() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [viteBin, "build"], {
      cwd: projectRoot,
      stdio: "inherit",
    });

    child.on("exit", (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });

    child.on("error", (error) => {
      console.error(error);
      resolve(1);
    });
  });
}

function startServer() {
  if (serverProcess || shuttingDown) {
    return;
  }

  serverProcess = spawn(process.execPath, [serverScript, "--serve-only"], {
    cwd: projectRoot,
    env: childEnv,
    stdio: ["ignore", "inherit", "inherit"],
  });

  serverProcess.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    if (watcher) {
      watcher.close();
    }
    process.exit(code ?? (signal ? 1 : 0));
  });
}

async function rebuild(reason) {
  if (shuttingDown) {
    return;
  }

  if (buildInProgress) {
    rebuildQueued = true;
    return;
  }

  buildInProgress = true;
  try {
    console.log(`[dev] rebuilding due to ${reason}...`);
    const code = await runViteBuild();
    if (code !== 0) {
      console.error("[dev] rebuild failed; keeping the previous dist output available.");
    }
  } finally {
    buildInProgress = false;

    if (rebuildQueued) {
      rebuildQueued = false;
      scheduleRebuild("queued changes");
    }
  }
}

function scheduleRebuild(reason) {
  if (shuttingDown) {
    return;
  }

  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    void rebuild(reason);
  }, 150);
}

function shouldRebuild(filename) {
  if (!filename) {
    return false;
  }

  const normalized = filename.replaceAll("\\", "/").toLowerCase();

  if (
    normalized.startsWith("dist/") ||
    normalized.startsWith("node_modules/") ||
    normalized.startsWith(".git/") ||
    normalized.startsWith(".codex/")
  ) {
    return false;
  }

  return (
    normalized.startsWith("src/") ||
    normalized.startsWith("public/") ||
    watchedFiles.has(normalized)
  );
}

function startWatcher() {
  if (watcher || shuttingDown) {
    return;
  }

  watcher = watch(
    projectRoot,
    {
      recursive: true,
    },
    (eventType, filename) => {
      if (!shouldRebuild(filename)) {
        return;
      }

      scheduleRebuild(`${eventType}:${filename}`);
    },
  );

  watcher.on("error", (error) => {
    console.error("[dev] file watcher error:", error);
  });
}

async function main() {
  console.log("[dev] running initial production build...");
  const initialBuildCode = await runViteBuild();

  if (initialBuildCode !== 0 && !existsSync(distIndexHtml)) {
    console.error("[dev] initial build failed and no existing dist output was found.");
    process.exit(initialBuildCode || 1);
  }

  startServer();
  startWatcher();
}

process.on("SIGINT", () => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  clearTimeout(rebuildTimer);

  if (watcher) {
    watcher.close();
  }

  if (serverProcess) {
    serverProcess.kill("SIGINT");
  }

  process.exit(0);
});

process.on("SIGTERM", () => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  clearTimeout(rebuildTimer);

  if (watcher) {
    watcher.close();
  }

  if (serverProcess) {
    serverProcess.kill("SIGTERM");
  }

  process.exit(0);
});

void main();
