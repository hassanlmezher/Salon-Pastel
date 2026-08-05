import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const quickBenefits = [
  "Instant availability",
  "No account needed",
  "English & Arabic",
];

const serviceCategories = [
  {
    name: "Manicure",
    nameAr: "مانيكير",
    description: "Shape, care, extensions, colour and nail art.",
    image: "/optimized/Rubber%20%2B%20Gel%20Color.webp",
    href: "/book/manicure",
    count: "15 services",
  },
  {
    name: "Pedicure",
    nameAr: "بديكير",
    description: "Polished finishes, foot care and restorative treatments.",
    image: "/optimized/pedicure/Pedicure%20%2B%20Gel%20Color%20(Gelish).webp",
    href: "/book/pedicure",
    count: "6 services",
  },
] as const;

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fbf7f3] text-[#241b18]">
      <header className="sticky top-0 z-50 border-b border-[#eadfda]/80 bg-[#fbf7f3]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.75rem] max-w-[86rem] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Pastel Salon home" className="group leading-none">
            <span className="block font-display text-[2rem] font-semibold tracking-[-0.04em] text-[#7d463d] transition group-hover:text-[#9d5f55]">
              Pastel
            </span>
            <span className="mt-1 hidden text-[0.56rem] font-semibold uppercase tracking-[0.28em] text-[#826d66] sm:block">
              Nail & beauty lounge
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#695751] md:flex" aria-label="Main navigation">
            <a href="#services" className="transition hover:text-[#8d5147]">Services</a>
            <a href="#experience" className="transition hover:text-[#8d5147]">Why Pastel</a>
            <a href="#contact" className="transition hover:text-[#8d5147]">Contact</a>
          </nav>

          <button
            type="button"
            onClick={() => navigate("/book")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#8d5147] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(111,61,52,0.22)] transition hover:-translate-y-0.5 hover:bg-[#754138] sm:px-6"
          >
            Book now
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 soft-grid opacity-60" aria-hidden="true" />
          <div className="relative mx-auto grid min-h-[calc(100svh-4.75rem)] max-w-[86rem] items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-8 lg:py-16">
            <div className="relative z-10 max-w-[40rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e5d6d0] bg-white/70 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8d5147] shadow-sm">
                <Sparkles size={14} aria-hidden="true" />
                Your appointment, beautifully simple
              </div>

              <h1 className="mt-7 text-balance font-display text-[3.65rem] font-semibold leading-[0.88] tracking-[-0.055em] text-[#342521] sm:text-[5.5rem] lg:text-[6.5rem]">
                A little time,
                <span className="block italic text-[#a66055]">just for you.</span>
              </h1>

              <p className="mt-7 max-w-[34rem] text-base leading-7 text-[#6f5e58] sm:text-lg sm:leading-8">
                Thoughtful nail care, beautiful finishes and a calm experience—from the first tap to the final detail.
              </p>
              <p className="mt-3 max-w-[34rem] text-right text-sm leading-7 text-[#7a6560]" lang="ar" dir="rtl">
                عناية متقنة بالأظافر، لمسات جميلة وتجربة مريحة من أول خطوة حتى آخر تفصيل.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/book")}
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#8d5147] px-7 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(111,61,52,0.24)] transition hover:-translate-y-0.5 hover:bg-[#754138]"
                >
                  Choose a service
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <a
                  href="tel:+96171430542"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#ddd0ca] bg-white/70 px-7 text-sm font-semibold text-[#4e3a35] transition hover:border-[#cdaea7] hover:bg-white"
                >
                  <Phone size={17} aria-hidden="true" />
                  +961 71 430 542
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-[#695751]">
                {quickBenefits.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#e9d6d2] text-[#844b42]">
                      <Check size={12} strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[44rem] lg:max-w-none">
              <div className="absolute -left-5 -top-5 h-28 w-28 rounded-full bg-[#efd6d0] blur-2xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] bg-[#ded2cc] shadow-[0_35px_90px_rgba(65,42,36,0.2)] sm:rounded-[2.75rem]">
                <img
                  src="/hero-poster.webp"
                  alt="Elegant natural manicure at Pastel Salon"
                  className="aspect-[4/4.6] w-full object-cover object-center sm:aspect-[4/4.1] lg:aspect-[4/4.5]"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c1c18]/45 via-transparent to-white/5" aria-hidden="true" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-[1.35rem] border border-white/40 bg-white/84 p-4 shadow-xl backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8d5147]">Open today</p>
                    <p className="mt-1 font-display text-xl font-semibold text-[#382722] sm:text-2xl">8:30 am — 6:00 pm</p>
                  </div>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f0d9d4] text-[#8d5147] sm:h-14 sm:w-14">
                    <Clock3 size={22} aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="border-y border-[#eadfda] bg-[#f2e7e2] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-[86rem]">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#995b50]">Start here</p>
                <h2 className="mt-3 max-w-[38rem] font-display text-5xl font-semibold leading-[0.95] tracking-[-0.035em] text-[#342521] sm:text-6xl">
                  What are you in the mood for?
                </h2>
              </div>
              <p className="max-w-[27rem] text-sm leading-7 text-[#705e58] sm:text-right">
                Pick a category, find your treatment, then choose a live available time. No sign-up, no waiting.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {serviceCategories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="group grid overflow-hidden rounded-[2rem] bg-[#fffaf7] shadow-[0_18px_50px_rgba(83,52,45,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(83,52,45,0.16)] sm:grid-cols-[0.8fr_1.2fr]"
                >
                  <div className="overflow-hidden bg-[#eaded8]">
                    <img
                      src={category.image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="aspect-[16/10] h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:aspect-auto"
                    />
                  </div>
                  <div className="flex min-h-[16rem] flex-col p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full bg-[#f1e2de] px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-[#8d5147]">
                        {category.count}
                      </span>
                      <span className="grid h-11 w-11 place-items-center rounded-full border border-[#dfcfca] text-[#7a463e] transition group-hover:bg-[#8d5147] group-hover:text-white">
                        <ArrowRight size={18} aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-auto pt-8">
                      <h3 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#352621] sm:text-5xl">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-xl text-[#9a5d53]" lang="ar" dir="rtl">{category.nameAr}</p>
                      <p className="mt-4 max-w-sm text-sm leading-6 text-[#705e58]">{category.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-[86rem] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#995b50]">Easy from start to finish</p>
              <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.035em] text-[#342521] sm:text-6xl">
                Your time is precious. Booking should be effortless.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Sparkles, step: "01", title: "Choose", text: "Browse clear services with price and duration upfront." },
                { icon: CalendarDays, step: "02", title: "Schedule", text: "See real availability and pick the time that suits you." },
                { icon: Check, step: "03", title: "Confirm", text: "Add your contact details and your appointment is set." },
              ].map((item) => (
                <article key={item.step} className="rounded-[1.5rem] border border-[#eadfda] bg-white p-6 shadow-[0_12px_36px_rgba(83,52,45,0.06)]">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f1e2de] text-[#8d5147]">
                      <item.icon size={19} aria-hidden="true" />
                    </span>
                    <span className="font-display text-2xl italic text-[#c6a49d]">{item.step}</span>
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-semibold text-[#342521]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#705e58]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-[#32231f] px-4 py-12 text-[#fffaf7] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[86rem] gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-display text-5xl font-semibold tracking-[-0.04em]">Pastel</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Nail and beauty care made calm, personal and easy to book.</p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <a href="tel:+96171430542" className="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/15 px-5 text-white/80 transition hover:bg-white/10 hover:text-white">
              <Phone size={16} aria-hidden="true" /> +961 71 430 542
            </a>
            <span className="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/15 px-5 text-white/80">
              <MapPin size={16} aria-hidden="true" /> Lebanon
            </span>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[86rem] flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Pastel Salon</span>
          <span>Open daily · 8:30 am – 6:00 pm</span>
        </div>
      </footer>
    </div>
  );
}
