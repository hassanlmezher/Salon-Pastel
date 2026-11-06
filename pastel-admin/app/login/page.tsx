"use client";

import { useEffect, useState } from "react";
import { getSignedInEmail, loginOwner, type LoginErrorKey } from "../actions";
import { LoginPasswordField } from "../components/LoginPasswordField";
import { LoginSubmitButton } from "../components/LoginSubmitButton";

const errorMessages: Record<LoginErrorKey, string> = {
  invalid: "The email or password is incorrect.",
  missing: "Enter the owner email and password.",
  locked: "Too many wrong tries. Wait 15 minutes, then try again.",
  network: "Could not reach the server. Check the connection and try again.",
};

export default function LoginPage() {
  const [errorKey, setErrorKey] = useState<LoginErrorKey | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Already signed in: go straight to the appointments.
    getSignedInEmail().then((email) => {
      if (email) window.location.replace("/");
    });
  }, []);

  return (
    <main className="loginPage">
      <section className="loginPanel" aria-labelledby="login-title">
        <div className="adminBrand loginBrand">
          <span>Pastel</span>
          <small>Admin</small>
        </div>
        <h1 id="login-title">Sign in</h1>

        {errorKey ? <p className="formError" role="alert">{errorMessages[errorKey]}</p> : null}

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
      </section>
    </main>
  );
}
