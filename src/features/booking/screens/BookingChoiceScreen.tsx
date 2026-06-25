import { useNavigate } from "react-router-dom";

const choices = [
  {
    id: "manicure",
    title: "Manicure Stuff",
    descriptionAr: "اختاري هذا الخيار للعناية بالأظافر، الطلاء، سبا اليدين وخدمات المناكير.",
  },
  {
    id: "pedicure",
    title: "Pedicure Stuff",
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

        <div className="mt-14 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d68599]">
            Book an appointment
          </p>
          <h1 className="mt-4 font-display text-[3.5rem] font-semibold leading-none text-[#4d2a16] sm:text-[5rem]">
            Choose your service type.
          </h1>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => navigate(`/book/${choice.id}`)}
              className="border border-[#e7c9c2]/80 bg-[#fff9f4] p-6 text-left shadow-[0_18px_42px_rgba(97,58,24,0.1)] transition hover:-translate-y-1 hover:border-[#f6c9b8] hover:bg-white sm:p-8"
            >
              <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-[#6d3f1f]">
                {choice.title}
              </h2>
              <p className="mt-4 text-right text-sm leading-7 text-[#6d5648]" lang="ar" dir="rtl">
                {choice.descriptionAr}
              </p>
              <div className="mt-8">
                <span className="inline-flex min-h-[72px] w-full max-w-[15.5rem] flex-col items-center justify-center gap-1.5 border border-[#f7d6df] bg-[#f6c9b8] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-[#4d2a16] shadow-[0_18px_38px_rgba(214,133,153,0.24)]">
                  <span>Choose</span>
                  <span className="text-[0.82rem] normal-case tracking-normal" lang="ar" dir="rtl">
                    اختر
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
