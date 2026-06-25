import Link from "next/link";
import { fetchActiveServices } from "../../src/features/booking/data/supabaseBooking";
import {
  getOptimizedServiceImage,
  serviceGroups,
  type ServiceGroupId,
  type ServiceMenuItem,
} from "../../src/features/booking/data/serviceMenu";

type ServiceMenuProps = {
  groupId: ServiceGroupId;
  title: string;
};

async function getServices(groupId: ServiceGroupId): Promise<ServiceMenuItem[]> {
  try {
    return await fetchActiveServices(groupId);
  } catch {
    return [...serviceGroups[groupId]];
  }
}

export async function ServiceMenu({ groupId, title }: ServiceMenuProps) {
  const services = await getServices(groupId);

  return (
    <main className="serviceMenuPage">
      <div className="serviceMenuInner">
        <div className="serviceMenuTopbar">
          <a className="serviceMenuBack" href="/book" aria-label="Go back">
            ←
          </a>
          <a className="serviceMenuBrand" href="/">
            Pastel
          </a>
        </div>

        <section className="serviceMenuHeader" aria-labelledby="service-menu-title">
          <p>Book an appointment</p>
          <h1 id="service-menu-title">{title}</h1>
        </section>

        <section className="serviceMenuGrid" aria-label={title}>
          {services.length === 0 ? <p className="serviceMenuState">No services are available right now.</p> : null}
          {services.map((service) => (
            <Link className="serviceMenuCard" href={`/book/${groupId}/${service.slug}`} key={service.name} prefetch={false}>
              <img src={getOptimizedServiceImage(service.imageSrc)} alt={service.name} loading="lazy" decoding="async" />
              <span aria-hidden="true">+</span>
              <h2>{service.name}</h2>
              <div />
              <p>Select this service to continue your appointment.</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
