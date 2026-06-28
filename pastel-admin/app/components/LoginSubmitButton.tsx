"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <button type="submit" className="loginSubmit" disabled={pending} aria-busy={pending}>
        {pending ? (
          <span className="loginSubmitPending">
            <LoaderCircle size={24} strokeWidth={2} aria-hidden="true" />
            Signing in
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      {pending ? (
        <div className="loginLoadingScreen" role="status" aria-live="polite" aria-label="Signing in">
          <div className="loginLoadingPanel">
            <LoaderCircle className="loginLoadingIcon" size={44} strokeWidth={1.9} aria-hidden="true" />
            <p>Signing in</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
