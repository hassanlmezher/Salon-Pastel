import type { ServiceMenuItem } from "../../src/features/booking/data/serviceMenu";

type ServiceMenuProps = {
  groupId: "manicure" | "pedicure";
  title: string;
  services: ServiceMenuItem[];
};

export function ServiceMenu({ groupId, title, services }: ServiceMenuProps) {
  return (
    <main className="serviceMenuPage">
      <div className="serviceMenuInner">
        <div className="serviceMenuTopbar">
          <a className="serviceMenuBrand" href="/">
            Pastel
          </a>
          <a className="serviceMenuBack" href="/book">
            Back
          </a>
        </div>

        <section className="serviceMenuHeader" aria-labelledby="service-menu-title">
          <p>Book an appointment</p>
          <h1 id="service-menu-title">{title}</h1>
        </section>

        <section className="serviceMenuGrid" aria-label={title}>
          {services.map((service) => (
            <a className="serviceMenuCard" href={`/book/${groupId}/${service.slug}`} key={service.name}>
              <img src={service.imageSrc} alt={service.name} />
              <span aria-hidden="true">+</span>
              <h2>{service.name}</h2>
              <div />
              <p>Select this service to continue your appointment.</p>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
