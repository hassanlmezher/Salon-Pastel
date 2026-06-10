import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const distDir = join(rootDir, "dist");
const preferredPort = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const serveOnly = process.argv.includes("--serve-only");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

const indexHtmlPath = join(distDir, "index.html");

if (!serveOnly) {
  execSync("npx vite build", { cwd: rootDir, stdio: "inherit" });
} else if (!existsSync(indexHtmlPath)) {
  execSync("npx vite build", { cwd: rootDir, stdio: "inherit" });
}

await mkdir(distDir, { recursive: true });

function getListeners(port) {
  try {
    const output = execSync(`lsof -t -iTCP:${port} -sTCP:LISTEN`, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return output ? output.split("\n").map((pid) => Number(pid)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getProcessCommand(pid) {
  try {
    return execSync(`ps -ww -p ${pid} -o command=`, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function clearOwnListener(port) {
  const listeners = getListeners(port);
  for (const pid of listeners) {
    const command = getProcessCommand(pid);
    const isSameProject =
      command.includes("scripts/dev-server.mjs") ||
      command.includes("vite --host") ||
      command.includes(rootDir);

    if (isSameProject) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        // Ignore processes that disappear between inspection and kill.
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendFile(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  res.statusCode = 200;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-cache");
  createReadStream(filePath).pipe(res);
}

async function sendIndex(res) {
  const html = await readFile(indexHtmlPath, "utf8");
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.end(html);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || host}`);
    const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.(\/|\\|$))+/, "");
    const relativePath = safePath === "/" ? "/index.html" : safePath;
    const filePath = join(distDir, relativePath);

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      sendFile(res, filePath);
      return;
    }

    await sendIndex(res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(error instanceof Error ? error.message : "Internal server error");
  }
});
server.setMaxListeners(0);

async function listen(port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.removeListener("error", reject);
      resolve(port);
    });
  });
}

let activePort = preferredPort;
const fallbackPorts = [
  ...Array.from({ length: 100 }, (_, index) => preferredPort + index),
  ...Array.from({ length: 50 }, (_, index) => 5173 + index),
  ...Array.from({ length: 50 }, (_, index) => 8080 + index),
];

try {
  await listen(activePort);
} catch (error) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "EADDRINUSE" || error.code === "EPERM")
  ) {
    for (const port of fallbackPorts) {
      const listeners = getListeners(port);
      if (listeners.length > 0) {
        clearOwnListener(port);
      }

      try {
        activePort = port;
        await listen(activePort);
        break;
      } catch (retryError) {
        if (
          retryError &&
          typeof retryError === "object" &&
          "code" in retryError &&
          (retryError.code === "EADDRINUSE" || retryError.code === "EPERM")
        ) {
          await sleep(100);
          continue;
        }
        throw retryError;
      }
    }
  } else {
    throw error;
  }
}

const mode = serveOnly ? "preview" : "dev";
console.log(`Salon Pastel ${mode} server running at http://localhost:${activePort}/`);
