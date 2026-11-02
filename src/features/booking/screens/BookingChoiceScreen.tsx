import { useNavigate } from "react-router-dom";

const choices = [
  {
    id: "manicure",
    title: "Manicure",
    titleAr: "مانيكير",
    description: "Nails, polish, extensions and hand spa.",
    descriptionAr: "اختاري هذا الخيار للعناية بالأظافر، الطلاء، سبا اليدين وخدمات المناكير.",
  },
  {
    id: "pedicure",
    title: "Pedicure",
    titleAr: "بديكير",
    description: "Foot care, polish and foot spa.",
    descriptionAr: "اختاري هذا الخيار للعناية بالقدمين، سبا القدم، التشذيب والطلاء.",
  },
] as const;

export function BookingChoiceScreen() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-[#f7efe6] px-4 py-10 text-[#231814] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[72rem]">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-display text-[42px] font-semibold leading-none text-[#8a4f24] sm:text-[56px]"
          >
            Pastel
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-2 inline-flex min-h-10 items-center border border-[#e7c9c2] bg-[#fffaf6]/92 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d3f1f] shadow-[0_10px_22px_rgba(97,58,24,0.08)] transition hover:bg-white sm:mt-3"
          >
            Back
          </button>
        </div>

        <div className="mt-10 max-w-2xl sm:mt-14">
          <h1 className="font-display text-[2.6rem] font-semibold leading-none text-[#4d2a16] sm:text-[4.5rem]">
            What would you like?
          </h1>
          <p className="mt-3 text-lg text-[#6d5648]" lang="ar" dir="rtl">
            ماذا تودين أن تحجزي؟
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => navigate(`/book/${choice.id}`)}
              className="flex min-h-[8.5rem] items-center justify-between gap-4 border border-[#e7c9c2]/80 bg-[#fff9f4] p-6 text-left shadow-[0_18px_42px_rgba(97,58,24,0.1)] transition hover:border-[#bd736b] hover:bg-white active:bg-[#f9e9e5] sm:p-8"
            >
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-3 font-display text-[2rem] font-semibold leading-none text-[#4d2a16]">
                  <span>{choice.title}</span>
                  <span className="text-[1.5rem]" lang="ar" dir="rtl">{choice.titleAr}</span>
                </span>
                <span className="mt-3 block text-sm leading-6 text-[#6d5648]">{choice.description}</span>
                <span className="mt-1 block text-right text-sm leading-6 text-[#6d5648]" lang="ar" dir="rtl">
                  {choice.descriptionAr}
                </span>
              </span>
              <span aria-hidden="true" className="grid h-12 w-12 flex-none place-items-center bg-[#bd736b] text-2xl text-white">
                →
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
