import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getServiceArabicCopy, serviceGroups, type ServiceGroupId } from "../data/serviceMenu";

type ServiceMenuPageProps = {
  groupId: ServiceGroupId;
  title: string;
};

function getOptimizedImage(src: string) {
  if (src.startsWith("/services/")) {
    return `/optimized${src.replace(/\.png$/i, ".webp")}`;
  }
  return `/optimized${src.replace(/\.png$/i, ".webp")}`;
}

export function ServiceMenuPage({ groupId, title }: ServiceMenuPageProps) {
  const services = serviceGroups[groupId];
  const [query, setQuery] = useState("");
  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return services;

    return services.filter((service) => {
      const arabicCopy = getServiceArabicCopy(service.slug);
      return [service.name, service.description, service.serviceType, arabicCopy.title]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, services]);

  return (
    <div className="min-h-screen bg-[#fbf7f3] text-[#241b18]">
      <header className="sticky top-0 z-50 border-b border-[#eadfda]/85 bg-[#fbf7f3]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.75rem] max-w-[86rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-display text-[2rem] font-semibold tracking-[-0.04em] text-[#7d463d]" aria-label="Pastel home">
            Pastel
          </Link>
          <Link to="/book" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dfd2cd] bg-white px-4 text-sm font-semibold text-[#59433d] transition hover:border-[#c9aaa3]">
            <ArrowLeft size={16} aria-hidden="true" />
            Categories
          </Link>
        </div>
      </header>

      <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-[86rem]">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#88736c]" aria-label="Booking progress">
            <span className="rounded-full bg-[#8d5147] px-3 py-1.5 text-white">1 · Service</span>
            <span aria-hidden="true">—</span>
            <span>2 · Time</span>
            <span aria-hidden="true">—</span>
            <span>3 · Confirm</span>
          </div>

          <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_26rem] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#995b50]">Choose your treatment</p>
              <h1 className="mt-3 font-display text-[3.5rem] font-semibold leading-[0.9] tracking-[-0.045em] text-[#342521] sm:text-[5rem]">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#705e58]">
                Price and duration are shown upfront. Tap any service to see available times and finish your booking.
              </p>
            </div>

            <label className="relative block">
              <span className="sr-only">Search services</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a7e76]" size={18} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${groupId} services`}
                className="h-14 w-full rounded-full border border-[#dfd2cd] bg-white pl-12 pr-12 text-sm text-[#342521] shadow-[0_8px_25px_rgba(78,49,42,0.06)] outline-none transition placeholder:text-[#9d8b85] focus:border-[#b8786d] focus:ring-4 focus:ring-[#ead6d1]"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-[#7b6862] hover:bg-[#f3e7e3]" aria-label="Clear search">
                  <X size={17} aria-hidden="true" />
                </button>
              ) : null}
            </label>
          </div>

          <div className="mt-8 flex items-center justify-between border-y border-[#eadfda] py-3 text-xs font-medium text-[#7a6862]">
            <span>{filteredServices.length} {filteredServices.length === 1 ? "service" : "services"}</span>
            <span lang="ar" dir="rtl">اختاري الخدمة المناسبة لكِ</span>
          </div>

          {filteredServices.length > 0 ? (
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label={title}>
              {filteredServices.map((service) => {
                const arabicCopy = getServiceArabicCopy(service.slug);

                return (
                  <Link
                    key={service.name}
                    to={`/book/${groupId}/${service.slug}`}
                    className="group flex min-h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#eadfda] bg-[#fffdfa] shadow-[0_12px_34px_rgba(79,50,43,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#d5b8b1] hover:shadow-[0_20px_48px_rgba(79,50,43,0.13)]"
                  >
                    <div className="relative overflow-hidden bg-[#eee2dd]">
                      <img
                        src={getOptimizedImage(service.imageSrc)}
                        alt={service.name}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = decodeURIComponent(service.imageSrc);
                        }}
                      />
                      <span className="absolute right-3 top-3 rounded-full bg-[#fffdfa]/90 px-3 py-1.5 text-xs font-semibold text-[#8d5147] shadow-sm backdrop-blur-md">
                        {service.price}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9a675e]">{service.serviceType}</p>
                          <h2 className="mt-2 text-balance font-display text-[1.65rem] font-semibold leading-[1.02] tracking-[-0.025em] text-[#342521]">
                            {service.name}
                          </h2>
                        </div>
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f0e2de] text-[#8d5147] transition group-hover:bg-[#8d5147] group-hover:text-white">
                          <ArrowRight size={17} aria-hidden="true" />
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#71605a]">{service.description}</p>
                      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                        <p className="text-sm font-medium text-[#7d6963]">{service.duration}</p>
                        <p className="max-w-[55%] text-right text-sm leading-5 text-[#8d5147]" lang="ar" dir="rtl">{arabicCopy.title}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-[#e4d5d0] bg-white p-10 text-center">
              <p className="font-display text-3xl font-semibold text-[#342521]">No matching services</p>
              <p className="mt-2 text-sm text-[#705e58]">Try a shorter search or browse the full list.</p>
              <button type="button" onClick={() => setQuery("")} className="mt-5 rounded-full bg-[#8d5147] px-5 py-3 text-sm font-semibold text-white">Show all services</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
