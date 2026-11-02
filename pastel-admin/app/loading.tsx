export default function Loading() {
  return (
    <div className="adminLoading" role="status" aria-live="polite">
      <span className="adminSpinner" aria-hidden="true" />
      Loading…
    </div>
  );
}
