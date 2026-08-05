import { ArrowLeft, ArrowRight, Clock3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const choices = [
  {
    id: "manicure",
    title: "Manicure",
    titleAr: "مانيكير",
    description: "Nail care, colour, extensions, spa treatments and detailed finishes.",
    descriptionAr: "العناية بالأظافر، الألوان، التطويل، علاجات السبا واللمسات الدقيقة.",
    image: "/optimized/Rubber%20%2B%20Gel%20Color.webp",
    meta: "15 services",
  },
  {
    id: "pedicure",
    title: "Pedicure",
    titleAr: "بديكير",
    description: "Foot care, gel colour, French finishes and restorative treatments.",
    descriptionAr: "العناية بالقدمين، الجل، الفرنش والعلاجات المرطبة.",
    image: "/optimized/pedicure/Pedicure%20%2B%20Gel%20Color%20(Gelish).webp",
    meta: "6 services",
  },
] as const;

export function BookingChoiceScreen() {
  return (
    <div className="min-h-screen bg-[#fbf7f3] text-[#241b18]">
      <header className="border-b border-[#eadfda] bg-[#fbf7f3]/94 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.75rem] max-w-[80rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-display text-[2rem] font-semibold tracking-[-0.04em] text-[#7d463d]" aria-label="Pastel home">
            Pastel
          </Link>
          <Link to="/" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dfd2cd] bg-white px-4 text-sm font-semibold text-[#59433d] transition hover:border-[#c9aaa3]">
            <ArrowLeft size={16} aria-hidden="true" />
            Home
          </Link>
        </div>
      </header>

      <main className="soft-grid px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-[80rem]">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#88736c]" aria-label="Booking progress">
            <span className="rounded-full bg-[#8d5147] px-3 py-1.5 text-white">1 · Service</span>
            <span aria-hidden="true">—</span>
            <span>2 · Time</span>
            <span aria-hidden="true">—</span>
            <span>3 · Confirm</span>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#995b50]">Book an appointment</p>
              <h1 className="mt-3 max-w-3xl text-balance font-display text-[3.5rem] font-semibold leading-[0.92] tracking-[-0.045em] text-[#342521] sm:text-[5rem]">
                What can we do for you today?
              </h1>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#705e58] lg:justify-self-end lg:text-right">
              Choose a category to see every service with its price and duration. You’ll only need a name and phone number to finish.
            </p>
          </div>

          <section className="mt-10 grid gap-5 lg:grid-cols-2" aria-label="Choose a service category">
            {choices.map((choice) => (
              <Link
                key={choice.id}
                to={`/book/${choice.id}`}
                className="group overflow-hidden rounded-[2rem] border border-[#eadfda] bg-[#fffaf7] shadow-[0_20px_55px_rgba(79,50,43,0.1)] transition duration-300 hover:-translate-y-1 hover:border-[#d8bcb5] hover:shadow-[0_28px_70px_rgba(79,50,43,0.16)]"
              >
                <div className="relative overflow-hidden bg-[#eaded8]">
                  <img src={choice.image} alt="" aria-hidden="true" className="aspect-[16/8.2] w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/85 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#7d463d] backdrop-blur-md sm:left-6 sm:top-6">
                    {choice.meta}
                  </span>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#342521] sm:text-5xl">{choice.title}</h2>
                      <p className="mt-1 text-xl text-[#a15f55]" lang="ar" dir="rtl">{choice.titleAr}</p>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#efe0dc] text-[#8d5147] transition group-hover:bg-[#8d5147] group-hover:text-white">
                      <ArrowRight size={19} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-5 max-w-lg text-sm leading-6 text-[#6f5d57]">{choice.description}</p>
                  <p className="mt-2 max-w-lg text-right text-sm leading-6 text-[#7b6862]" lang="ar" dir="rtl">{choice.descriptionAr}</p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#8d5147]">
                    <Sparkles size={14} aria-hidden="true" />
                    View services
                  </div>
                </div>
              </Link>
            ))}
          </section>

          <div className="mt-7 flex flex-col gap-3 rounded-[1.25rem] border border-[#e8dad5] bg-white/65 p-4 text-sm text-[#705e58] sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-[#995b50]" aria-hidden="true" /> Most bookings take less than two minutes.</span>
            <span lang="ar" dir="rtl">الحجز سريع ولا يحتاج إلى إنشاء حساب.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
