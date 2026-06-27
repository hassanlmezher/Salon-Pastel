import { LockKeyhole } from "lucide-react";
import { loginOwner, logoutOwner } from "../actions";
import { createSupabaseServerClient } from "../../src/lib/supabase/server";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  invalid: "The email or password is incorrect.",
  missing: "Enter the owner email and password.",
  not_owner: "This account is not listed as an owner.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? errorMessages[params.error] : "";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="loginPage">
      <section className="loginCard" aria-labelledby="login-title">
        <div className="loginMark" aria-hidden="true">
          <LockKeyhole size={24} strokeWidth={1.8} />
        </div>
        <p className="eyebrow">Pastel owner access</p>
        <h1 id="login-title">Admin login</h1>
        <p className="loginIntro">Sign in with the owner account to view and manage appointments.</p>

        {error ? <p className="formError">{error}</p> : null}

        {user ? (
          <form action={logoutOwner} className="loginForm">
            <p className="signedInNotice">Signed in as {user.email}. This account needs owner access.</p>
            <button type="submit">Log out</button>
          </form>
        ) : (
          <form action={loginOwner} className="loginForm">
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button type="submit">Log in</button>
          </form>
        )}
      </section>
    </main>
  );
}
