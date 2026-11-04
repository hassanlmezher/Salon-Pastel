export function LoginSubmitButton({ pending }: { pending: boolean }) {
  return (
    <button type="submit" className="loginSubmit" disabled={pending} aria-busy={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
