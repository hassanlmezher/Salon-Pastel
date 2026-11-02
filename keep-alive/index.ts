/**
 * Runs once a day. Free Supabase projects pause after a week without traffic,
 * which would take booking offline, so this makes one tiny read.
 */
interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export default {
  async scheduled(_controller: unknown, env: Env) {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/services?select=id&limit=1`, {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
    });
    if (!response.ok) throw new Error(`Supabase keep-alive failed: ${response.status}`);
  },
};
