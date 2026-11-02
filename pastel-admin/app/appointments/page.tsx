import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Old link kept working: everything now lives on the home screen. */
export default async function AppointmentsAliasPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries((await searchParams) ?? {})) {
    if (typeof value === "string") params.set(key, value);
  }
  const query = params.toString();
  redirect(query ? `/?${query}` : "/");
}
