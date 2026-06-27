import { spawn, execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const host = "127.0.0.1";
const port = "5173";
const nextBin = join(rootDir, "node_modules", "next", "dist", "bin", "next");
const nextDir = join(rootDir, ".next");

function commandOutput(command, args) {
  try {
    return execFileSync(command, args, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function getPortListeners() {
  const output = commandOutput("lsof", ["-tiTCP:5173", "-sTCP:LISTEN"]);
  return output
    ? output
        .split("\n")
        .map((pid) => Number(pid))
        .filter(Boolean)
    : [];
}

function getProcessCommand(pid) {
  return commandOutput("ps", ["-ww", "-p", String(pid), "-o", "command="]);
}

async function waitForPortToClear() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (getPortListeners().length === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function clearSameProjectServer() {
  for (const pid of getPortListeners()) {
    const command = getProcessCommand(pid);
    const isSameProject = command.includes(rootDir) || (command.includes("next") && command.includes(port));

    if (!isSameProject) {
      console.error(`Port ${port} is already used by another process: ${command || pid}`);
      process.exit(1);
    }

    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // The process may have already exited.
    }
  }

  await waitForPortToClear();

  for (const pid of getPortListeners()) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // The process may have already exited.
    }
  }

  await waitForPortToClear();
}

await clearSameProjectServer();
await rm(nextDir, { recursive: true, force: true });

const child = spawn(process.execPath, [nextBin, "dev", "-H", host, "-p", port], {
  cwd: rootDir,
  stdio: "inherit",
  env: process.env,
});

function stop(signal) {
  child.kill(signal);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
