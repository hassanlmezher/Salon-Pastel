/**
 * The site's files are served straight from Cloudflare's static hosting; this
 * script only runs for the daily keep-alive below. Free Supabase projects pause
 * after a week without traffic, which would take booking offline.
 */
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export default {
  fetch(request: Request, env: Env) {
    return env.ASSETS.fetch(request);
  },

  async scheduled(_controller: unknown, env: Env) {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/services?select=id&limit=1`, {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
    });
    if (!response.ok) throw new Error(`Supabase keep-alive failed: ${response.status}`);
  },
};
