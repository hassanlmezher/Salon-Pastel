"use client";

import { useEffect, useRef, useState } from "react";

const offerings = [
  {
    title: "Nail Care & Manicure",
    copy: "Clean shaping, cuticle care, polish, and refined everyday nail grooming.",
    copyAr: "تنظيف وتشكيل الأظافر، عناية بالجلد المحيط، طلاء، ولمسة نهائية مرتبة لكل يوم.",
  },
  {
    title: "Pedicure Services",
    copy: "Relaxed foot care with soaking, exfoliation, shaping, and a polished finish.",
    copyAr: "عناية مريحة بالقدمين مع نقع، تقشير، تشكيل، ولمسة طلاء أنيقة.",
  },
  {
    title: "Hand Treatments & Spa",
    copy: "Softening hand rituals with hydration, massage, and spa-focused care.",
    copyAr: "علاجات لتنعيم اليدين مع ترطيب، تدليك، وعناية سبا هادئة.",
  },
  {
    title: "Nail Treatments",
    copy: "Strengthening and recovery treatments for healthier natural nails.",
    copyAr: "علاجات تقوية وتعافي للحصول على أظافر طبيعية أكثر صحة.",
  },
] as const;

const bookHref = "/book";

export default function Home() {
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroVideoReady(true), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let frame = 0;

    const updatePinnedState = () => {
      const node = ctaRef.current;
      if (!node) return;

      setIsPinned(node.getBoundingClientRect().top <= 0);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updatePinnedState);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <main className="pastelLanding">
      <section className="pastelHero">
        <video
          className="pastelHeroVideo"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/hero-poster.webp"
          aria-hidden="true"
        >
          {heroVideoReady ? <source src="/hero-banner.mp4" type="video/mp4" /> : null}
        </video>
        <div className="pastelHeroOverlay" />

        <header className="pastelHeader" aria-label="Pastel Nail Salon">
          <a className="pastelWordmark" href="/">
            <span>Pastel</span>
            <small>Nail and beauty lounge</small>
          </a>
        </header>

        <div className="pastelHeroCopy">
          <h1>Welcome to Pastel Nail Salon.</h1>
          <p className="pastelHeroArabic" lang="ar" dir="rtl">
            أهلاً بك في صالون باستيل للأظافر.
          </p>
        </div>

        <div ref={ctaRef} className="pastelHeroCta">
          <a className="pastelBookButton" href={bookHref}>
            <span>Book an Appointment</span>
            <span className="pastelBookButtonArabic" lang="ar" dir="rtl">
              احجز موعدك
            </span>
          </a>
        </div>
      </section>

      <div className={`pastelStickyCta ${isPinned ? "isPinned" : ""}`} aria-hidden={!isPinned}>
        <a className="pastelBookButton" href={bookHref}>
          <span>Book an Appointment</span>
          <span className="pastelBookButtonArabic" lang="ar" dir="rtl">
            احجز موعدك
          </span>
        </a>
      </div>

      <section className="pastelServices" aria-labelledby="offerings-title">
        <div className="pastelSectionInner">
          <div className="pastelSectionHeader">
            <span />
            <h2 id="offerings-title">What We Offer</h2>
            <p>Detailed nail and spa services designed for clean finishes, soft skin, and calm salon appointments.</p>
          </div>

          <div className="pastelServiceGrid">
            {offerings.map((item) => (
              <article className="pastelServiceBlock" key={item.title}>
                <div>{item.title.charAt(0)}</div>
                <h3>{item.title}</h3>
                <p>
                  {item.copy}
                  <span className="pastelServiceBlockArabic" lang="ar" dir="rtl">
                    {item.copyAr}
                  </span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="pastelFooter">
        <div className="pastelFooterInner">
          <div>
            <p className="pastelFooterBrand">Pastel</p>
            <p className="pastelFooterTag">Nail and beauty lounge</p>
          </div>
          <div>
            <small lang="ar" dir="rtl">المالكة</small>
            <p>Haifa Salman Mezher</p>
          </div>
          <div>
            <small lang="ar" dir="rtl">الهاتف</small>
            <p>+961 71 430 542</p>
          </div>
          <div>
            <small lang="ar" dir="rtl">ساعات العمل</small>
            <p>8:30 am till 6 pm</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
