import { Link, useSearchParams } from "react-router-dom";
import {
  getOptimizedServiceImage,
  getServiceArabicCopy,
  serviceGroups,
  type ServiceGroupId,
} from "../data/serviceMenu";

const tabs: { id: ServiceGroupId; label: string; labelAr: string }[] = [
  { id: "manicure", label: "Manicure", labelAr: "مانيكير" },
  { id: "pedicure", label: "Pedicure", labelAr: "بديكير" },
];

export function serviceImageUrl(imageSrc: string) {
  return decodeURIComponent(getOptimizedServiceImage(imageSrc));
}

/** One page for both service types: tabs on top, a compact tappable list below. */
export function ServiceMenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const groupId: ServiceGroupId = searchParams.get("type") === "pedicure" ? "pedicure" : "manicure";
  const services = serviceGroups[groupId];

  return (
    <main className="min-h-screen bg-[#f7efe6] pb-10 text-[#231814]">
      <header className="sticky top-0 z-30 border-b border-[#e7c9c2]/70 bg-[#f7efe6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 pt-3">
          <Link to="/" className="font-display text-[2rem] font-semibold leading-none text-[#8a4f24]">
            Pastel
          </Link>
          <p className="text-right text-sm text-[#6d5648]">
            Choose a service <span lang="ar" dir="rtl" className="block">اختاري الخدمة</span>
          </p>
        </div>
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 px-4 py-3" role="tablist" aria-label="Service type">
          {tabs.map((tab) => {
            const active = tab.id === groupId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSearchParams(tab.id === "manicure" ? {} : { type: tab.id }, { replace: true })}
                className={`flex min-h-12 items-center justify-center gap-2 border text-base font-semibold transition ${
                  active ? "border-[#bd736b] bg-[#bd736b] text-white" : "border-[#e7c9c2] bg-[#fffaf6] text-[#6d3f1f]"
                }`}
              >
                <span>{tab.label}</span>
                <span lang="ar" dir="rtl" className="font-normal">
                  {tab.labelAr}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <ul className="mx-auto mt-3 grid max-w-3xl gap-2 px-4 sm:grid-cols-2" aria-label={`${groupId} services`}>
        {services.map((service) => (
          <li key={service.slug}>
            <Link
              to={`/book/${groupId}/${service.slug}`}
              className="flex min-h-[5.5rem] items-center gap-3 border border-[#ead5cd] bg-[#fffaf6] p-2.5 pr-3 shadow-[0_6px_16px_rgba(97,58,24,0.06)] transition hover:border-[#bd736b] active:bg-[#f9e9e5]"
            >
              <img
                src={serviceImageUrl(service.imageSrc)}
                alt=""
                loading="lazy"
                width={72}
                height={72}
                className="h-[4.5rem] w-[4.5rem] flex-none object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[1.2rem] font-semibold leading-tight">{service.name}</span>
                <span lang="ar" dir="rtl" className="mt-0.5 block text-right text-sm leading-5 text-[#6d5648]">
                  {getServiceArabicCopy(service.slug).title}
                </span>
              </span>
              <span className="flex-none text-right">
                <strong className="block font-display text-[1.3rem] font-semibold leading-none text-[#b46f65]">{service.price}</strong>
                <span className="mt-1 block text-xs text-[#6d5648]">{service.duration}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
