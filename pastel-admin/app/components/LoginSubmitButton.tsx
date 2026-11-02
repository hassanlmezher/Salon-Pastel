"use client";

import { useFormStatus } from "react-dom";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="loginSubmit" disabled={pending} aria-busy={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
