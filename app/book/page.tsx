const choices = [
  {
    href: "/book/manicure",
    title: "Manicure Stuff",
    copy: "Choose this for nail care, polish, hand spa, and manicure services.",
  },
  {
    href: "/book/pedicure",
    title: "Pedicure Stuff",
    copy: "Choose this for pedicure care, foot spa, shaping, and polish services.",
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
              <p>{choice.copy}</p>
              <span>Choose</span>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
