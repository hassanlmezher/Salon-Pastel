import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange, PhoneCall, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Chip } from "../../../components/ui/Chip";
import { useBooking } from "../context/BookingContext";
import { useBookingData } from "../hooks/useBookingData";
import { BookingLayout } from "../components/BookingLayout";
import { AddOnSheet } from "../components/AddOnSheet";
import { ServiceRadioCard } from "../components/ServiceRadioCard";
import { SkeletonState } from "../components/SkeletonState";
import { StaffPreference } from "../components/StaffPreference";

export function ServiceStepScreen() {
  const navigate = useNavigate();
  const { draft, updateDraft, staff, staffLoading } = useBooking();
  const { config, serviceOptions, loading } = useBookingData();

  const currentServiceOption = serviceOptions.find((item) => item.service.id === draft.serviceId) ?? null;
  const timezoneNote =
    config && Intl.DateTimeFormat().resolvedOptions().timeZone !== config.salonTimezone
      ? `You are viewing times in ${config.salonTimezone}. Your device is set to ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`
      : undefined;

  return (
    <BookingLayout
      step="service"
      title="Choose your service"
      description="Start with the base service, then refine with any relevant add-ons and a staff preference if you want one."
      timezone={config?.salonTimezone ?? "Europe/London"}
      timezoneNote={timezoneNote}
      ctaLabel="Continue to date & time"
      ctaDisabled={!draft.serviceId}
      onCta={() => navigate("/book/schedule")}
      mobileTitle={currentServiceOption?.service.name ?? "Choose your service"}
      mobileSubtitle="Select a service to continue."
    >
      {loading ? (
        <div className="space-y-4">
          <SkeletonState lines={4} />
          <SkeletonState lines={3} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <Card className="paper-panel overflow-hidden p-0">
              <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="p-6 sm:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-rich">
                    Salon catalogue
                  </p>
                  <h2 className="mt-3 font-display text-[36px] leading-none text-text">
                    Choose the service first. We handle the realistic timing after that.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-text-secondary">
                    This step behaves more like a high-end salon menu than a generic booking form. Pick the base service and the available add-ons and specialists will narrow automatically.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Chip className="border-gold-soft/35 bg-gold-soft/10 text-gold-rich">Guest booking</Chip>
                    <Chip>Live duration updates</Chip>
                    <Chip>Any available by default</Chip>
                  </div>
                </div>
                <div className="action-panel p-6 text-white sm:p-7">
                  <div className="space-y-4">
                    <PromoLine icon={<CalendarRange size={16} />} label="Fast funnel" value="3 guided steps" />
                    <PromoLine icon={<ShieldCheck size={16} />} label="Policy" value="Free changes up to 24h" />
                    <PromoLine icon={<PhoneCall size={16} />} label="Large groups" value="Enquiry route for 4+ guests" />
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-5 xl:grid-cols-2">
              {serviceOptions.map((option, index) => (
                <motion.div
                  key={option.service.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <ServiceRadioCard
                    service={option.service}
                    checked={draft.serviceId === option.service.id}
                    onChange={(serviceId) =>
                      updateDraft((current) => ({
                        ...current,
                        serviceId,
                        addOnIds: [],
                        staffId: null,
                        selectedDate: null,
                        selectedSlotIso: null,
                      }))
                    }
                  />
                </motion.div>
              ))}
            </div>

            {currentServiceOption ? (
              <AddOnSheet
                addOns={currentServiceOption.addOns}
                selectedIds={draft.addOnIds}
                onToggle={(addOnId) =>
                  updateDraft((current) => {
                    const addOnIds = current.addOnIds.includes(addOnId)
                      ? current.addOnIds.filter((item) => item !== addOnId)
                      : [...current.addOnIds, addOnId];

                    return {
                      ...current,
                      addOnIds,
                      selectedSlotIso: null,
                    };
                  })
                }
              />
            ) : null}

            {draft.serviceId ? (
              staffLoading ? (
                <SkeletonState lines={4} />
              ) : (
                <StaffPreference
                  staff={staff}
                  selectedStaffId={draft.staffId}
                  onSelect={(staffId) =>
                    updateDraft((current) => ({
                      ...current,
                      staffId,
                      selectedSlotIso: null,
                    }))
                  }
                />
              )
            ) : null}

            <div className="rounded-[24px] border border-stroke bg-surface p-5 text-sm leading-7 text-text-secondary">
              Group bookings for four or more guests are handled separately to keep timings accurate.
              <Button type="button" variant="ghost" className="ml-2 px-0 text-gold-rich">
                Enquire instead
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </BookingLayout>
  );
}

function PromoLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
      <span className="inline-flex items-center gap-2 text-sm text-white/70">
        <span className="text-gold-soft">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
