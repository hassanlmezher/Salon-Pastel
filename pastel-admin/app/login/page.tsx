"use client";

import { useEffect, useState } from "react";
import { loginOwner, logoutOwner, type LoginErrorKey } from "../actions";
import { LoginPasswordField } from "../components/LoginPasswordField";
import { LoginSubmitButton } from "../components/LoginSubmitButton";
import { getSupabaseClient } from "../../src/lib/supabase/client";
import { isSupabaseConfigured } from "../../src/lib/supabase/config";

const errorMessages: Record<LoginErrorKey, string> = {
  invalid: "The email or password is incorrect.",
  missing: "Enter the owner email and password.",
  not_owner: "This account is not listed as an owner.",
  not_configured: "Admin login is not configured yet. Add the Supabase environment variables and rebuild the app.",
  network: "Could not reach the server. Check the connection and try again.",
};

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const [errorKey, setErrorKey] = useState<LoginErrorKey | null>(configured ? null : "not_configured");
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!configured) return;

    const fromUrl = new URLSearchParams(window.location.search).get("error");
    if (fromUrl && fromUrl in errorMessages) setErrorKey(fromUrl as LoginErrorKey);

    // A signed-in non-owner stays here with a way to log out; an owner goes straight in.
    getSupabaseClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (!session) return;
        if (fromUrl === "not_owner") setSignedInEmail(session.user.email ?? "");
        else window.location.replace("/");
      });
  }, [configured]);

  return (
    <main className="loginPage">
      <section className="loginPanel" aria-labelledby="login-title">
        <div className="adminBrand loginBrand">
          <span>Pastel</span>
          <small>Admin</small>
        </div>
        <h1 id="login-title">Sign in</h1>

        {errorKey ? <p className="formError" role="alert">{errorMessages[errorKey]}</p> : null}

        {!configured ? (
          <p className="signedInNotice">
            Copy <code>.env.example</code> to <code>.env.local</code>, add the Supabase URL and anon key, then restart the admin app.
          </p>
        ) : signedInEmail !== null ? (
          <form action={logoutOwner} className="loginForm">
            <p className="signedInNotice">Signed in as {signedInEmail}. This account needs owner access.</p>
            <button type="submit" className="loginSubmit">Log out</button>
          </form>
        ) : (
          <form
            className="loginForm"
            onSubmit={async (event) => {
              // Handled here instead of a form action so a wrong password keeps the typed email.
              event.preventDefault();
              setPending(true);
              const result = await loginOwner(new FormData(event.currentTarget));
              if (result) {
                setErrorKey(result);
                setPending(false);
              } else {
                window.location.replace("/");
              }
            }}
          >
            <label className="loginField">
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" required />
            </label>
            <LoginPasswordField />
            <LoginSubmitButton pending={pending} />
          </form>
        )}
      </section>
    </main>
  );
}
