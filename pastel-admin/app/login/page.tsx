import { UserRound } from "lucide-react";
import { loginOwner, logoutOwner } from "../actions";
import { LoginPasswordField } from "../components/LoginPasswordField";
import { LoginSubmitButton } from "../components/LoginSubmitButton";
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
      <div className="loginPalm loginPalmTop" aria-hidden="true" />
      <div className="loginPalm loginPalmBottom" aria-hidden="true" />
      <div className="loginBottomWave" aria-hidden="true" />

      <section className="loginPanel" aria-labelledby="login-title">
        <header className="loginBrand" aria-label="Pastel Admin">
          <div className="loginTextLogo">
            <span className="loginPastelName">Pastel</span>
            <span className="loginAdminName">Admin</span>
            <span className="loginOwnerName">Owner Dashboard</span>
          </div>
        </header>

        <div className="loginOrnament" aria-hidden="true">
          <svg viewBox="0 0 120 120" focusable="false">
            <path d="M54 28h18l4 34H50l4-34Z" />
            <path d="M47 62h32a5 5 0 0 1 5 5v28H42V67a5 5 0 0 1 5-5Z" />
            <path d="M86 57h10l3 38H84l2-38Z" />
            <path d="M30 86c7-17 17-22 28-26" />
            <path d="M31 84c-9-10-8-20-2-27 8 8 8 18 2 27Z" />
            <path d="M42 72c-10-3-15-10-15-19 11 2 17 9 15 19Z" />
            <path d="M24 52l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" />
            <path d="M99 37l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" />
            <path d="M102 63l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" />
          </svg>
        </div>

        <div className="loginWelcome">
          <h1 id="login-title">Welcome Back</h1>
          <p>Sign in to access your salon dashboard</p>
        </div>

        <div className="loginCard">
          {error ? <p className="formError">{error}</p> : null}

          {user ? (
            <form action={logoutOwner} className="loginForm">
              <p className="signedInNotice">Signed in as {user.email}. This account needs owner access.</p>
              <button type="submit" className="loginSubmit">Log out</button>
            </form>
          ) : (
            <form action={loginOwner} className="loginForm">
              <label className="loginInputShell">
                <span className="loginInputIcon" aria-hidden="true">
                  <UserRound size={30} strokeWidth={1.7} />
                </span>
                <input name="email" type="email" autoComplete="email" placeholder="Email address" required />
              </label>

              <LoginPasswordField />

              <div className="loginOptions">
                <label className="rememberControl">
                  <input name="remember" type="checkbox" />
                  <span>Remember me</span>
                </label>
                <span className="forgotPassword">Forgot password?</span>
              </div>

              <LoginSubmitButton />
              <p className="loginAccessNote">Only authorized owner can access this dashboard.</p>
            </form>
          )}
        </div>
      </section>

    </main>
  );
}
