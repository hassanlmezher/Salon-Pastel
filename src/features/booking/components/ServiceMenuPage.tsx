import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchActiveServices } from "../data/supabaseBooking";
import type { ServiceGroupId, ServiceMenuItem } from "../data/serviceMenu";

type ServiceMenuPageProps = {
  groupId: ServiceGroupId;
  title: string;
};

export function ServiceMenuPage({ groupId, title }: ServiceMenuPageProps) {
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f4_0%,#f7efe6_54%,#ead9c9_100%)] px-3 py-8 text-[#231814] sm:px-5 lg:px-8">
      <div className="mx-auto w-full">
        <div className="flex items-start justify-between gap-4">
          <a
            href="/"
            className="ml-1 font-display text-[42px] font-semibold leading-none text-[#8a4f24] sm:text-[56px]"
          >
            Pastel
          </a>
          <a
            href="/book"
            className="mt-2 inline-flex min-h-10 items-center border border-[#e7c9c2] bg-[#fffaf6]/92 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d3f1f] shadow-[0_10px_22px_rgba(97,58,24,0.08)] transition hover:bg-white sm:mt-3"
          >
            Back
          </a>
        </div>

        <section className="mt-10 sm:mt-14" aria-labelledby="service-menu-title">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d68599]">
            Book an appointment
          </p>
          <h1
            id="service-menu-title"
            className="mt-3 whitespace-nowrap font-display text-[2.25rem] font-semibold leading-none text-[#4d2a16] sm:text-[4.5rem]"
          >
            {title}
          </h1>
        </section>

        <section className="mt-8 grid w-full grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-7" aria-label={title}>
          {isLoading ? (
            <p className="col-span-full border border-[#ead5cd] bg-[#fffaf6]/92 p-5 text-sm text-[#6d5648]">
              Loading services...
            </p>
          ) : null}
          {!isLoading && errorMessage ? (
            <p className="col-span-full border border-[#ead5cd] bg-[#fffaf6]/92 p-5 text-sm text-[#6d5648]">
              {errorMessage}
            </p>
          ) : null}
          {!isLoading && !errorMessage && services.length === 0 ? (
            <p className="col-span-full border border-[#ead5cd] bg-[#fffaf6]/92 p-5 text-sm text-[#6d5648]">
              No services are available right now.
            </p>
          ) : null}
          {services.map((service) => (
            <Link
              key={service.name}
              to={`/book/${groupId}/${service.slug}`}
              className="service-menu-card flex min-h-[18rem] flex-col items-center bg-[#fffaf6] px-3 py-5 text-center shadow-[0_16px_34px_rgba(97,58,24,0.12)] sm:min-h-[22rem] sm:px-5 sm:py-7 lg:min-h-[27rem] lg:px-7 lg:py-8"
            >
              <img
                src={service.imageSrc}
                alt={service.name}
                className="service-menu-image aspect-square w-[76%] max-w-[13rem] object-cover shadow-[0_10px_24px_rgba(97,58,24,0.1)]"
              />
              <span className="service-menu-icon -mt-5 grid h-10 w-10 place-items-center border-2 border-white bg-[#dfb9aa] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(97,58,24,0.16)] sm:h-12 sm:w-12">
                +
              </span>
              <h2 className="mt-4 max-w-full text-balance font-display text-[1.2rem] font-semibold leading-[1.05] text-[#231814] sm:text-[1.65rem] lg:text-[2rem]">
                {service.name}
              </h2>
              <span className="mt-4 h-px w-10 bg-[#d7aa9d]" />
              <p className="mt-4 text-[0.78rem] leading-5 text-[#6d5648] sm:text-sm sm:leading-6">
                Select this service to continue your appointment.
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
