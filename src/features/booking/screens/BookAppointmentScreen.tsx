import { addDays, format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Feather,
  Footprints,
  Hand,
  Leaf,
  Smile,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../lib/cn";

const bookingServices = [
  {
    id: "manicure",
    name: "Manicure",
    price: "$15.00",
    duration: "45 min",
    description: "Clean shaping, cuticle care, and a polished gloss finish.",
    accent: "Soft hand ritual",
    icon: Hand,
  },
  {
    id: "pedicure",
    name: "Pedicure",
    price: "$25.00",
    duration: "60 min",
    description: "Soothing soak, neat shaping, smoothing care, and polish.",
    accent: "Restorative foot care",
    icon: Footprints,
  },
  {
    id: "facial",
    name: "Facial",
    price: "$50.00",
    duration: "50 min",
    description: "Glow-focused skin treatment with calm botanical care.",
    accent: "Fresh skin reset",
    icon: Smile,
  },
  {
    id: "laser",
    name: "Laser Service",
    price: "$35.00",
    duration: "30 min",
    description: "Fast, targeted appointment with a precise consultation flow.",
    accent: "Clean precision",
    icon: Zap,
  },
  {
    id: "waxing",
    name: "Waxing full body",
    price: "$60.00",
    duration: "75 min",
    description: "Smooth full-body care with discreet professional handling.",
    accent: "Silky finish",
    icon: Feather,
  },
  {
    id: "massage",
    name: "Massage body therapy",
    price: "$40.00",
    duration: "60 min",
    description: "Restorative body therapy for deep relaxation and reset.",
    accent: "Calm body release",
    icon: Leaf,
  },
] as const;

const baseTimeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
] as const;

const stepMeta = [
  { id: 1, label: "Service", title: "Choose service" },
  { id: 2, label: "Day", title: "Choose day" },
  { id: 3, label: "Hour", title: "Choose hour" },
] as const;

type BookingStep = (typeof stepMeta)[number]["id"];
type BookingServiceId = (typeof bookingServices)[number]["id"];
type TimeSlot = (typeof baseTimeSlots)[number];

export function BookAppointmentScreen() {
  const reduceMotion = useReducedMotion();
  const autoAdvanceTimer = useRef<number | null>(null);
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<BookingServiceId | null>(null);
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) {
        window.clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, []);

  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const date = addDays(new Date(), index + 1);
        const weekdayIndex = date.getDay();
        const isAvailable = weekdayIndex !== 0 && index !== 4 && index !== 10;

        return {
          iso: format(date, "yyyy-MM-dd"),
          weekday: format(date, "EEE"),
          day: format(date, "d"),
          month: format(date, "MMM"),
          full: format(date, "EEEE, MMM d"),
          available: isAvailable,
        };
      }),
    [],
  );

  const timeSlots = useMemo(() => {
    const dateOffset = selectedDateIso ? days.findIndex((day) => day.iso === selectedDateIso) : 0;
    const unavailableByDate = dateOffset % 2 === 0 ? ["12:30", "15:30", "17:30"] : ["09:00", "13:00", "16:30"];

    return baseTimeSlots.map((time) => ({
      time,
      available: !unavailableByDate.includes(time),
    }));
  }, [days, selectedDateIso]);

  const selectedService = bookingServices.find((service) => service.id === selectedServiceId) ?? null;
  const selectedDay = days.find((day) => day.iso === selectedDateIso) ?? null;
  const allStepsComplete = Boolean(selectedService && selectedDay && selectedTime);

  const scheduleAutoAdvance = (nextStep: BookingStep) => {
    if (autoAdvanceTimer.current) {
      window.clearTimeout(autoAdvanceTimer.current);
    }

    autoAdvanceTimer.current = window.setTimeout(() => {
      setStep(nextStep);
    }, 250);
  };

  const selectService = (serviceId: BookingServiceId) => {
    setSelectedServiceId(serviceId);
    setSelectedDateIso(null);
    setSelectedTime(null);
    setSubmitted(false);
    scheduleAutoAdvance(2);
  };

  const selectDay = (dateIso: string) => {
    setSelectedDateIso(dateIso);
    setSelectedTime(null);
    setSubmitted(false);
    scheduleAutoAdvance(3);
  };

  const selectTime = (time: TimeSlot) => {
    setSelectedTime(time);
    setSubmitted(false);
  };

  const goBack = () => setStep((current) => (current > 1 ? ((current - 1) as BookingStep) : current));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3e7dc] text-[#1f1814]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.78),transparent_28%),radial-gradient(circle_at_top_right,rgba(242,211,154,0.28),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(183,134,67,0.14),transparent_26%),linear-gradient(180deg,#fbf5ef_0%,#f3e7dc_58%,#ead8ca_100%)]" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(127,92,70,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(127,92,70,0.055)_1px,transparent_1px)] [background-size:72px_72px]" />
      <motion.div
        aria-hidden="true"
        className="absolute right-[-8rem] top-24 h-72 w-72 rounded-full bg-[#fff7ef]/70 blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, 18, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <section className="relative mx-auto w-full px-0 py-8 lg:py-10">
        <div className="mb-8 flex flex-col gap-4 px-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.34em] text-[#8b6b58]">Appointment journey</p>
            <h1 className="mt-3 font-display text-[2.65rem] leading-[0.9] tracking-[-0.045em] text-[#241812] sm:text-[4.2rem] lg:text-[5rem]">
              Book your appointment
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6d5648] sm:text-base">
              A calm three-step salon booking flow: choose the service, select an available day, then reserve the hour.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#cdb9a7] bg-[rgba(255,248,243,0.74)] px-4 py-2 text-sm font-medium text-[#5f4a3c] shadow-[0_12px_30px_rgba(74,50,36,0.08)] backdrop-blur-sm transition hover:border-[#b69278] hover:text-[#3f2d24]"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </div>

        <div className="grid gap-6">
          <motion.div
            className="border-y border-white/70 bg-[rgba(255,251,247,0.84)] p-4 shadow-[0_24px_80px_rgba(74,50,36,0.10)] backdrop-blur-xl sm:p-6 lg:p-8"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <LuxuryProgressStepper
              currentStep={step}
              serviceComplete={Boolean(selectedService)}
              dayComplete={Boolean(selectedDay)}
              hourComplete={Boolean(selectedTime)}
              onStepChange={setStep}
            />

            <div className="mt-8 overflow-hidden border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.76)_0%,rgba(249,242,235,0.86)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] sm:p-6">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="service"
                    initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                    animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                    transition={{ duration: 0.34, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <SectionHeader
                      eyebrow="Step 1"
                      title="Choose a service"
                      description="Pick the treatment first. The selected card glows softly, then the flow moves to day selection."
                    />

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
                      {bookingServices.map((service, index) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          index={index}
                          selected={service.id === selectedServiceId}
                          onSelect={() => selectService(service.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : null}

                {step === 2 ? (
                  <motion.div
                    key="day"
                    initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                    animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                    transition={{ duration: 0.34, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <SectionHeader
                      eyebrow="Step 2"
                      title="Choose a day"
                      description="Available salon days are highlighted. Faded days are unavailable and cannot be selected."
                    />

                    <div className="rounded-[1.5rem] border border-[#e3d0c0] bg-white/58 p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-11 place-items-center rounded-full bg-[#b78643] text-white shadow-[0_14px_30px_rgba(109,63,31,0.22)]">
                            <CalendarDays className="size-5" />
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-[#8b6b58]">
                              Next two weeks
                            </p>
                            <p className="mt-1 text-sm text-[#6d5648]">Tap an available day to continue.</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {days.map((day, index) => (
                          <motion.button
                            key={day.iso}
                            type="button"
                            disabled={!day.available}
                            onClick={() => selectDay(day.iso)}
                            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.025, duration: 0.28 }}
                            whileHover={day.available && !reduceMotion ? { y: -4 } : undefined}
                            whileTap={day.available && !reduceMotion ? { scale: 0.985 } : undefined}
                            className={cn(
                              "rounded-[1.35rem] border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b78643]",
                              day.iso === selectedDateIso &&
                                "border-[#b78643] bg-[#b78643] text-white shadow-[0_18px_34px_rgba(109,63,31,0.20)]",
                              day.available &&
                                day.iso !== selectedDateIso &&
                                "border-[#ddcdbd] bg-white/78 text-[#2f241e] hover:border-[#b78643] hover:shadow-[0_16px_32px_rgba(74,50,36,0.10)]",
                              !day.available &&
                                "cursor-not-allowed border-[#e5d8cb]/70 bg-[#eee0d3]/50 text-[#9a8778] opacity-45",
                            )}
                          >
                            <span className="block text-xs uppercase tracking-[0.24em] opacity-80">{day.weekday}</span>
                            <span className="mt-3 block text-3xl font-semibold leading-none">{day.day}</span>
                            <span className="mt-2 block text-sm opacity-85">{day.month}</span>
                            <span className="mt-3 block text-[11px] uppercase tracking-[0.2em] opacity-70">
                              {day.available ? "Available" : "Unavailable"}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : null}

                {step === 3 ? (
                  <motion.div
                    key="hour"
                    initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                    animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                    transition={{ duration: 0.34, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <SectionHeader
                      eyebrow="Step 3"
                      title="Choose an hour"
                      description="Select a time slot to reveal the final appointment confirmation."
                    />

                    <div className="rounded-[1.5rem] border border-[#e3d0c0] bg-white/58 p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="grid size-11 place-items-center rounded-full bg-[#b78643] text-white shadow-[0_14px_30px_rgba(109,63,31,0.22)]">
                          <Clock3 className="size-5" />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-[#8b6b58]">
                            {selectedDay?.full ?? "Choose a day first"}
                          </p>
                          <p className="mt-1 text-sm text-[#6d5648]">Unavailable times are faded and locked.</p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {timeSlots.map((slot, index) => (
                          <motion.button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available || !selectedDay}
                            onClick={() => selectTime(slot.time)}
                            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02, duration: 0.26 }}
                            whileHover={slot.available && selectedDay && !reduceMotion ? { y: -3 } : undefined}
                            whileTap={slot.available && selectedDay && !reduceMotion ? { scale: 0.985 } : undefined}
                            className={cn(
                              "rounded-[1.2rem] border px-4 py-4 text-center text-sm font-semibold tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b78643]",
                              slot.time === selectedTime &&
                                "border-[#b78643] bg-[#b78643] text-white shadow-[0_18px_34px_rgba(109,63,31,0.20)]",
                              slot.available &&
                                selectedDay &&
                                slot.time !== selectedTime &&
                                "border-[#ddcdbd] bg-white/80 text-[#2f241e] hover:border-[#b78643]",
                              (!slot.available || !selectedDay) &&
                                "cursor-not-allowed border-[#e5d8cb]/70 bg-[#eee0d3]/48 text-[#9a8778] opacity-45",
                            )}
                          >
                            {slot.time}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {allStepsComplete ? (
                        <motion.div
                          key="final-confirmation"
                          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                          className="rounded-[1.5rem] border border-[#b78643]/25 bg-[#b78643]/[0.08] p-5"
                        >
                          <p className="text-base font-semibold text-[#2f241e]">
                            {submitted ? "Appointment request confirmed." : "Ready to confirm."}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#6d5648]">
                            Your {selectedService?.name.toLowerCase()} is set for {selectedDay?.full} at {selectedTime}.
                            {selectedService ? ` ${selectedService.price} · ${selectedService.duration}.` : ""}
                          </p>
                          {!submitted ? (
                            <Button
                              type="button"
                              onClick={() => setSubmitted(true)}
                              className="mt-5 bg-[linear-gradient(135deg,#b78643_0%,#e0b85f_48%,#f7e1a4_100%)] px-7 text-[#3c2412] shadow-[0_18px_38px_rgba(183,134,67,0.28)]"
                            >
                              Confirm appointment
                            </Button>
                          ) : null}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="secondary" type="button" onClick={goBack} disabled={step === 1}>
                Back
              </Button>

              <p className="text-sm leading-6 text-[#7a6253]">
                {step === 1
                  ? "Selecting a service moves you forward automatically."
                  : step === 2
                    ? "Pick an available day to continue."
                    : "Choose a time, then confirm below."}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function LuxuryProgressStepper({
  currentStep,
  serviceComplete,
  dayComplete,
  hourComplete,
  onStepChange,
}: {
  currentStep: BookingStep;
  serviceComplete: boolean;
  dayComplete: boolean;
  hourComplete: boolean;
  onStepChange: (step: BookingStep) => void;
}) {
  const completions = [serviceComplete, dayComplete, hourComplete];
  const finalProgress = currentStep === 3 && hourComplete ? 100 : ((currentStep - 1) / 2) * 100;

  const canVisitStep = (step: BookingStep) => {
    if (step === 1) return true;
    if (step === 2) return serviceComplete;
    return serviceComplete && dayComplete;
  };

  return (
    <nav aria-label="Booking progress" className="mx-auto max-w-2xl px-1 py-2">
      <div className="relative">
        <div className="absolute left-[12%] right-[12%] top-5 h-px bg-[#d8c8ba]" />
        <motion.div
          className="absolute left-[12%] top-5 h-px origin-left bg-[#b78643]"
          initial={false}
          animate={{ width: `${finalProgress * 0.76}%` }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />

        <ol className="relative grid grid-cols-3">
          {stepMeta.map((item, index) => {
            const isActive = currentStep === item.id;
            const isComplete = completions[index] && item.id < currentStep;
            const canVisit = canVisitStep(item.id);

            return (
              <li key={item.id} className="flex justify-center">
                <button
                  type="button"
                  disabled={!canVisit}
                  onClick={() => onStepChange(item.id)}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "group flex min-w-0 flex-col items-center gap-2 text-center focus-visible:outline-none",
                    !canVisit && "cursor-not-allowed",
                  )}
                >
                  <span
                    className={cn(
                      "relative grid size-10 place-items-center rounded-full border text-xs font-semibold transition",
                      isActive &&
                        "border-[#b78643] bg-[#b78643] text-white shadow-[0_12px_28px_rgba(109,63,31,0.28)]",
                      isComplete && "border-[#b78643] bg-[#b78643] text-white",
                      !isActive && !isComplete && "border-[#d8c8ba] bg-[#e7ded5] text-[#9a8778]",
                      canVisit && !isActive && "group-hover:border-[#9e6d8e]",
                    )}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="active-step-dot"
                        className="absolute inset-[-5px] rounded-full border border-[#b78643]/25 bg-[#b78643]/10"
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      />
                    ) : null}
                    <span className="relative z-10">
                      {isComplete ? <Check className="size-4" strokeWidth={2.8} /> : item.id}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.22em]",
                      isActive ? "text-[#b78643]" : "text-[#8b6b58]",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-[#8b6b58]">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl leading-none tracking-[-0.03em] text-[#2a201b] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d5648]">{description}</p>
    </div>
  );
}

function ServiceCard({
  service,
  index,
  selected,
  onSelect,
}: {
  service: (typeof bookingServices)[number];
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = service.icon;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.32, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group relative overflow-hidden rounded-[1.55rem] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b78643] sm:p-5",
        selected
          ? "border-[#b78643] bg-[#b78643]/10 shadow-[0_20px_42px_rgba(109,63,31,0.16)]"
          : "border-[#ddcdbd] bg-white/76 shadow-[0_14px_30px_rgba(74,50,36,0.06)] hover:border-[#b78643] hover:bg-white/92 hover:shadow-[0_22px_44px_rgba(74,50,36,0.11)]",
      )}
    >
      <div className="absolute right-[-2.5rem] top-[-2.5rem] size-20 rounded-full bg-[#f4d6df]/45 transition group-hover:scale-125 sm:size-24" />
      <div className="relative flex items-start justify-between gap-3 sm:gap-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-[1.1rem] bg-[#f3e3d7] text-[#b78643] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] sm:size-12">
          <Icon className="size-4 sm:size-5" />
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-[#b78643] sm:text-sm">{service.price}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#8b6b58] sm:text-xs sm:tracking-[0.18em]">{service.duration}</p>
        </div>
      </div>
      <div className="relative mt-4 sm:mt-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9b7a66] sm:text-[11px] sm:tracking-[0.24em]">{service.accent}</p>
        <p className="mt-2 text-base font-semibold leading-tight text-[#2f241e] sm:text-lg">{service.name}</p>
        <p className="mt-2 text-xs leading-5 text-[#6d5648] sm:text-sm sm:leading-6">{service.description}</p>
      </div>
      <motion.div
        className="relative mt-4 h-px bg-[#b78643]/30 sm:mt-5"
        initial={false}
        animate={{ scaleX: selected ? 1 : 0.34 }}
        transition={{ duration: 0.25 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.button>
  );
}
