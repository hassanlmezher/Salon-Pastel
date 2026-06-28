export function AdminSkeletonScreen({ overlay = false }: { overlay?: boolean }) {
  return (
    <div className={overlay ? "adminSkeletonOverlay" : "adminSkeletonRoute"} role="status" aria-live="polite" aria-label="Loading">
      <div className="adminSkeletonShell">
        <header className="adminSkeletonTopbar">
          <span className="adminSkeletonLine menu" />
          <div className="adminSkeletonBrand">
            <span />
            <i />
            <em />
          </div>
          <div className="adminSkeletonLogout">
            <span />
            <i />
          </div>
        </header>

        <section className="adminSkeletonSection">
          <span className="adminSkeletonHeading" />
          <div className="adminSkeletonMetricGrid">
            {Array.from({ length: 4 }).map((_, index) => (
              <article className="adminSkeletonMetric" key={index}>
                <span />
                <div>
                  <i />
                  <b />
                  <em />
                </div>
                <strong />
              </article>
            ))}
          </div>
        </section>

        <section className="adminSkeletonFilters">
          <span />
          <div>
            <i />
            <i />
            <i />
          </div>
        </section>

        <section className="adminSkeletonCards">
          {Array.from({ length: 3 }).map((_, index) => (
            <article className="adminSkeletonCard" key={index}>
              <span className="avatar" />
              <div className="main">
                <i className="name" />
                <i className="phone" />
                <i />
                <i />
              </div>
              <div className="side">
                <i />
                <i />
                <i />
              </div>
            </article>
          ))}
        </section>

        <nav className="adminSkeletonBottom">
          <span />
          <span />
        </nav>
      </div>
    </div>
  );
}
