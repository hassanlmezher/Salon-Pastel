import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Plain static files in out/: Cloudflare serves them free with no per-request server time.
  output: "export",
  reactStrictMode: true,
  outputFileTracingRoot: appRoot,
};

export default nextConfig;
