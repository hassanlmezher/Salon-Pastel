import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { BookingSummary } from "./components/BookingSummary";
import { Button } from "./components/Button";
import { ConfirmationPanel } from "./components/ConfirmationPanel";
import { DatePicker } from "./components/DatePicker";
import { Footer } from "./components/Footer";
import { LogoMark } from "./components/LogoMark";
import { MobileStickyBar } from "./components/MobileStickyBar";
import { ProgressSteps } from "./components/ProgressSteps";
import { SectionHeading } from "./components/SectionHeading";
import { ServiceCard } from "./components/ServiceCard";
import { TimeSlotGrid } from "./components/TimeSlotGrid";
import { availability, availableDateMap, services } from "./data/booking";
import { formatDateLabel } from "./lib/format";
import type { BookingStep } from "./types";

const initialMonth = new Date(2026, 5, 1);

function App() {
  const [step, setStep] = useState<BookingStep>(0);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [monthDate, setMonthDate] = useState(initialMonth);

  const selectedService =
    services.find((service) => service.id === selectedServiceId) ?? null;

  const selectedAvailability = selectedDate
    ? availableDateMap.get(selectedDate) ?? null
    : null;

  const availableDates = new Set(availability.map((entry) => entry.iso));

  const canProceed = {
    0: Boolean(selectedServiceId),
    1: Boolean(selectedDate),
    2: Boolean(selectedTime),
    3: true,
  } as const;

  const stepCopy = {
    0: {
      eyebrow: "Step 1 of 3",
      title: "Select a service",
      description:
        "Curated nail and skin treatments designed for calm, radiant results with a luxury private-studio feel.",
    },
    1: {
      eyebrow: "Step 2 of 3",
      title: "Choose your date",
      description:
        "Browse upcoming availability and reserve the day that suits your rhythm best.",
    },
    2: {
      eyebrow: "Step 3 of 3",
      title: "Choose your time",
      description:
        "Finish the booking by selecting an open time and reviewing your appointment details.",
    },
  } as const;

  const activeStep = step === 3 ? 2 : step;

  const goNext = () => {
    if (step < 2 && canProceed[step]) {
      setStep((current) => (current + 1) as BookingStep);
    }
  };

  const goBack = () => {
    if (step > 0 && step < 3) {
      setStep((current) => (current - 1) as BookingStep);
    }
  };

  const confirm = () => {
    if (selectedService && selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const resetBooking = () => {
    setStep(0);
    setSelectedServiceId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setMonthDate(initialMonth);
  };

  const onSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  const onSelectDate = (iso: string) => {
    setSelectedDate(iso);
    setSelectedTime(null);
  };

  const onMonthChange = (direction: number) => {
    setMonthDate(
      new Date(monthDate.getFullYear(), monthDate.getMonth() + direction, 1),
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f0e9] text-ink">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-5%] h-72 w-72 rounded-full bg-[#ecd8bc]/50 blur-3xl" />
        <div className="absolute right-[-8%] top-[10%] h-80 w-80 rounded-full bg-[#f8efe2]/70 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[15%] h-72 w-72 rounded-full bg-[#eadfcf]/65 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-16">
        <header className="rounded-[2rem] border border-white/70 bg-white/55 px-5 py-5 shadow-soft backdrop-blur-xl sm:px-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <LogoMark />
            <div className="max-w-xl text-sm leading-7 text-taupe">
              Salon Pastel pairs calm pacing with elevated detail. This booking flow is designed to feel clear, premium, and effortless from first tap to confirmation.
            </div>
          </div>
        </header>

        <main className="flex-1 pt-8">
          {step < 3 ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_24rem] lg:items-start">
              <section>
                <ProgressSteps currentStep={step} />

                <div className="mt-8">
                  <SectionHeading
                    eyebrow={stepCopy[activeStep].eyebrow}
                    title={stepCopy[activeStep].title}
                    description={stepCopy[activeStep].description}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.35 }}
                    className="mt-8"
                  >
                    {step === 0 ? (
                      <section id="services" aria-label="Select a service">
                        <div
                          className="grid gap-5 md:grid-cols-2"
                          role="radiogroup"
                          aria-label="Salon services"
                        >
                          {services.map((service, index) => (
                            <motion.div
                              key={service.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.08 }}
                            >
                              <ServiceCard
                                service={service}
                                selected={selectedServiceId === service.id}
                                onSelect={onSelectService}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {step === 1 ? (
                      <section id="availability" aria-label="Select a date">
                        <DatePicker
                          selectedDate={selectedDate}
                          monthDate={monthDate}
                          availabilityMap={availableDates}
                          onMonthChange={onMonthChange}
                          onSelectDate={onSelectDate}
                        />

                        {selectedDate ? (
                          <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-5 rounded-[1.8rem] border border-white/70 bg-white/65 p-5 text-sm text-taupe shadow-soft"
                          >
                            <span className="font-semibold uppercase tracking-[0.28em] text-gold-600">
                              Selected date
                            </span>
                            <p className="mt-2 font-display text-3xl text-ink">
                              {formatDateLabel(selectedDate)}
                            </p>
                          </motion.div>
                        ) : null}
                      </section>
                    ) : null}

                    {step === 2 ? (
                      <section
                        id="summary"
                        aria-label="Select a time and review booking"
                        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"
                      >
                        <TimeSlotGrid
                          availability={selectedAvailability}
                          selectedTime={selectedTime}
                          onSelectTime={setSelectedTime}
                        />
                        <div className="xl:hidden">
                          <BookingSummary
                            service={selectedService}
                            date={selectedDate}
                            time={selectedTime}
                            compact
                          />
                        </div>
                      </section>
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 hidden items-center gap-4 lg:flex">
                  {step > 0 ? (
                    <Button variant="secondary" onClick={goBack}>
                      Back
                    </Button>
                  ) : null}
                  {step < 2 ? (
                    <Button onClick={goNext} disabled={!canProceed[step]}>
                      Next step
                    </Button>
                  ) : null}
                </div>
              </section>

              <aside className="hidden lg:sticky lg:top-8 lg:block">
                <BookingSummary
                  service={selectedService}
                  date={selectedDate}
                  time={selectedTime}
                  onConfirm={step === 2 ? confirm : undefined}
                  disabled={!canProceed[2]}
                />
              </aside>
            </div>
          ) : (
            <ConfirmationPanel
              service={selectedService}
              date={selectedDate}
              time={selectedTime}
              onReset={resetBooking}
            />
          )}
        </main>
      </div>

      <Footer />

      <MobileStickyBar
        visible={step < 3}
        title={
          step === 0
            ? selectedService?.name ?? "Choose a service"
            : step === 1
              ? selectedDate
                ? formatDateLabel(selectedDate)
                : "Choose a date"
              : selectedTime ?? "Choose a time"
        }
        subtitle={
          step === 0
            ? "Next unlocks after a service is selected."
            : step === 1
              ? "Select a highlighted day to continue."
              : "Confirm once your preferred time is selected."
        }
        ctaLabel={step === 2 ? "Confirm booking" : "Next step"}
        disabled={!canProceed[step]}
        onPrimary={step === 2 ? confirm : goNext}
        backLabel={step > 0 ? "Back" : undefined}
        onBack={step > 0 ? goBack : undefined}
      />
    </div>
  );
}

export default App;
