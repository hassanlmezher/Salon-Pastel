import imageOne from "../src/images/image1.png";
import imageTwo from "../src/images/image2.png";
import imageThree from "../src/images/image3.png";
import pricesImage from "../src/images/prices.png";

const services = [
  ["Signature manicure", "Clean shaping, cuticle care, polish, and hand finish.", "$15"],
  ["Spa pedicure", "Soak, exfoliation, detailed nail care, and softening massage.", "$25"],
  ["Glow facial", "Hydration-focused skin refresh for a calm, luminous finish.", "$50"],
  ["Laser service", "Targeted beauty treatment with a polished appointment flow.", "$35"],
  ["Full body waxing", "Smooth, efficient waxing service with careful aftercare.", "$60"],
  ["Body therapy massage", "A focused reset for tension, circulation, and calm.", "$40"],
];

const gallery = [
  { src: imageOne, alt: "Pastel manicure detail" },
  { src: imageTwo, alt: "Pastel salon polish colors" },
  { src: imageThree, alt: "Pastel beauty lounge treatment room" },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <video className="heroVideo" autoPlay loop muted playsInline preload="auto" aria-hidden="true">
          <source src="/hero-banner.mp4" type="video/mp4" />
        </video>
        <div className="heroWash" />
        <header className="nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Pastel home">
            <span>Pastel</span>
            <small>Nail and beauty lounge</small>
          </a>
          <nav>
            <a href="#services">Services</a>
            <a href="#gallery">Studio</a>
            <a href="#booking">Book</a>
          </nav>
        </header>
        <div className="heroContent">
          <p className="eyebrow">Luxury beauty appointments</p>
          <h1>Pastel</h1>
          <p className="heroCopy">
            A polished nail and beauty lounge for calm appointments, refined finishes, and care that feels personal from the first minute.
          </p>
          <div className="heroActions">
            <a className="primaryButton" href="#booking">Book Appointment</a>
            <a className="secondaryButton" href="#services">View Services</a>
          </div>
        </div>
      </section>

      <section className="intro" aria-label="Salon highlights">
        <div>
          <span className="metric">6</span>
          <p>Beauty services with clear starting prices.</p>
        </div>
        <div>
          <span className="metric">9-7</span>
          <p>Appointments from Monday through Saturday.</p>
        </div>
        <div>
          <span className="metric">1:1</span>
          <p>Focused care with a calm guest experience.</p>
        </div>
      </section>

      <section className="services" id="services">
        <div className="sectionHeader">
          <p className="eyebrow">Seasonal specials</p>
          <h2>Beauty care, clearly priced.</h2>
        </div>
        <div className="serviceGrid">
          {services.map(([name, description, price]) => (
            <article className="serviceCard" key={name}>
              <div>
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
              <span>from {price}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="priceFeature" aria-label="Pastel service menu">
        <div className="priceImage">
          <img src={pricesImage.src} alt="Pastel service price menu" />
        </div>
        <div className="priceCopy">
          <p className="eyebrow">The Pastel standard</p>
          <h2>Soft color, exacting detail, and appointments that stay easy.</h2>
          <p>
            Choose a quick polish refresh, a full beauty appointment, or a complete reset day. Every visit is designed to feel organized, warm, and beautifully finished.
          </p>
          <a className="textLink" href="#booking">Reserve your time</a>
        </div>
      </section>

      <section className="gallery" id="gallery" aria-label="Pastel studio gallery">
        {gallery.map((item) => (
          <div className="galleryImage" key={item.alt}>
            <img src={item.src.src} alt={item.alt} />
          </div>
        ))}
      </section>

      <section className="booking" id="booking">
        <div className="bookingCopy">
          <p className="eyebrow">Book your visit</p>
          <h2>Tell us what you need, and we will prepare the appointment.</h2>
          <p>Use this request form to start a booking. Pastel will confirm the final time, service details, and any add-ons before your visit.</p>
        </div>
        <form className="bookingForm">
          <label>
            Name
            <input name="name" placeholder="Your name" />
          </label>
          <label>
            Phone
            <input name="phone" placeholder="+1 (000) 000-0000" />
          </label>
          <label>
            Service
            <select name="service" defaultValue="">
              <option value="" disabled>Select a service</option>
              {services.map(([name]) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Preferred date
            <input name="date" type="date" />
          </label>
          <label className="wide">
            Notes
            <textarea name="notes" rows={4} placeholder="Preferred time, nail style, or treatment notes" />
          </label>
          <button type="submit">Request Appointment</button>
        </form>
      </section>

      <footer className="footer">
        <div>
          <p className="footerBrand">Pastel</p>
          <p>Nail and beauty lounge</p>
        </div>
        <address>
          hello@pastelnailsalon.com<br />
          +1 (000) 000-0000<br />
          Mon-Sat, 9-7
        </address>
      </footer>
    </main>
  );
}
