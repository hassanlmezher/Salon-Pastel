"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchActiveServices } from "../../src/features/booking/data/supabaseBooking";
import type { ServiceGroupId, ServiceMenuItem } from "../../src/features/booking/data/serviceMenu";

type ServiceMenuProps = {
  groupId: ServiceGroupId;
  title: string;
};

export function ServiceMenu({ groupId, title }: ServiceMenuProps) {
  const [services, setServices] = useState<ServiceMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadServices() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const activeServices = await fetchActiveServices(groupId);
        if (isCurrent) setServices(activeServices);
      } catch {
        if (isCurrent) setErrorMessage("Unable to load services. Please try again.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadServices();

    return () => {
      isCurrent = false;
    };
  }, [groupId]);

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
          {isLoading ? <p className="serviceMenuState">Loading services...</p> : null}
          {!isLoading && errorMessage ? <p className="serviceMenuState">{errorMessage}</p> : null}
          {!isLoading && !errorMessage && services.length === 0 ? (
            <p className="serviceMenuState">No services are available right now.</p>
          ) : null}
          {services.map((service) => (
            <Link className="serviceMenuCard" href={`/book/${groupId}/${service.slug}`} key={service.name} prefetch>
              <img src={service.imageSrc} alt={service.name} />
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
