import { loginOwner, logoutOwner } from "../actions";
import { LoginPasswordField } from "../components/LoginPasswordField";
import { LoginSubmitButton } from "../components/LoginSubmitButton";
import { createSupabaseServerClient } from "../../src/lib/supabase/server";
import { isSupabaseConfigured } from "../../src/lib/supabase/config";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  invalid: "The email or password is incorrect.",
  missing: "Enter the owner email and password.",
  not_owner: "This account is not listed as an owner.",
  not_configured: "Admin login is not configured yet. Add the Supabase environment variables and restart the app.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const configured = isSupabaseConfigured();
  const errorKey = typeof params.error === "string" ? params.error : "";
  const error = configured ? errorMessages[errorKey] : errorMessages.not_configured;
  const user = configured
    ? (await (await createSupabaseServerClient()).auth.getUser()).data.user
    : null;

  return (
    <main className="loginPage">
      <section className="loginPanel" aria-labelledby="login-title">
        <div className="adminBrand loginBrand">
          <span>Pastel</span>
          <small>Admin</small>
        </div>
        <h1 id="login-title">Sign in</h1>

        {error ? <p className="formError">{error}</p> : null}

        {!configured ? (
          <p className="signedInNotice">
            Copy <code>.env.example</code> to <code>.env.local</code>, add the Supabase URL and anon key, then restart the admin app.
          </p>
        ) : user ? (
          <form action={logoutOwner} className="loginForm">
            <p className="signedInNotice">Signed in as {user.email}. This account needs owner access.</p>
            <button type="submit" className="loginSubmit">Log out</button>
          </form>
        ) : (
          <form action={loginOwner} className="loginForm">
            <label className="loginField">
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" required />
            </label>
            <LoginPasswordField />
            <LoginSubmitButton />
          </form>
        )}
      </section>
    </main>
  );
}
