import { ArrowLeft } from "lucide-react";
import { useState } from "react";
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

const ADMIN_URL = "https://pastel-salon-admin.pages.dev/";
const FROM_ADMIN_KEY = "pastel-from-admin";

/** The admin's "New appointment" button adds ?from=admin; remember it for this tab so the way back stays after switching tabs or services. */
function readFromAdmin(searchParams: URLSearchParams) {
  try {
    if (searchParams.get("from") === "admin") window.sessionStorage.setItem(FROM_ADMIN_KEY, "1");
    return window.sessionStorage.getItem(FROM_ADMIN_KEY) === "1";
  } catch {
    return searchParams.get("from") === "admin";
  }
}

export function serviceImageUrl(imageSrc: string) {
  return decodeURIComponent(getOptimizedServiceImage(imageSrc));
}

/** One page for both service types: tabs on top, a compact tappable list below. */
export function ServiceMenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const groupId: ServiceGroupId = searchParams.get("type") === "pedicure" ? "pedicure" : "manicure";
  const services = serviceGroups[groupId];
  const [fromAdmin] = useState(() => readFromAdmin(searchParams));

  // pb-24 keeps the last service above the 64px "Powered by Netlify" badge.
  return (
    <main className="min-h-screen bg-[#f7efe6] pb-24 text-[#231814]">
      <header className="sticky top-0 z-30 border-b border-[#e7c9c2]/70 bg-[#f7efe6]/95 backdrop-blur-md">
        {fromAdmin ? (
          <div className="mx-auto max-w-3xl px-4 pt-3">
            <a
              href={ADMIN_URL}
              className="inline-flex min-h-11 items-center gap-2 border border-[#e7c9c2] bg-[#fffaf6] px-4 text-sm font-semibold text-[#6d3f1f] transition hover:border-[#a3635c] active:bg-[#f9e9e5]"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Back to admin
            </a>
          </div>
        ) : null}
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 pt-3">
          <Link to="/" className="inline-flex min-h-11 items-center font-display text-[2rem] font-semibold leading-none text-[#8a4f24]">
            Pastel
          </Link>
          <h1 className="text-right text-sm text-[#6d5648]">
            Choose a service <span lang="ar" dir="rtl" className="block">اختاري الخدمة</span>
          </h1>
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
                  active ? "border-[#a3635c] bg-[#a3635c] text-white" : "border-[#e7c9c2] bg-[#fffaf6] text-[#6d3f1f]"
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
                <strong className="block font-display text-[1.3rem] font-semibold leading-none text-[#9e6259]">{service.price}</strong>
                <span className="mt-1 block text-xs text-[#6d5648]">{service.duration}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
