const choices = [
  {
    href: "/book/manicure",
    title: "Manicure Stuff",
    copyAr: "اختاري هذا الخيار للعناية بالأظافر، الطلاء، سبا اليدين وخدمات المناكير.",
  },
  {
    href: "/book/pedicure",
    title: "Pedicure Stuff",
    copyAr: "اختاري هذا الخيار للعناية بالقدمين، سبا القدم، التشذيب والطلاء.",
  },
] as const;

export default function BookPage() {
  return (
    <main className="bookingChoicePage">
      <div className="bookingChoiceInner">
        <div className="bookingChoiceTopbar">
          <a className="bookingChoiceBack" href="/" aria-label="Go back">
            ←
          </a>
          <a className="bookingChoiceBrand" href="/">
            Pastel
          </a>
        </div>

        <section className="bookingChoiceIntro" aria-labelledby="booking-choice-title">
          <p>Book an appointment</p>
          <h1 id="booking-choice-title">Choose your service type.</h1>
        </section>

        <section className="bookingChoiceGrid" aria-label="Service type">
          {choices.map((choice) => (
            <a className="bookingChoiceCard" href={choice.href} key={choice.href}>
              <h2>{choice.title}</h2>
              <p lang="ar" dir="rtl">{choice.copyAr}</p>
              <span className="bookingChoiceButton">
                <span>Choose</span>
                <span lang="ar" dir="rtl">اختر</span>
              </span>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
