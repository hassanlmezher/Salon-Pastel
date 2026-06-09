import { addMinutes } from "date-fns";
import { bookingConfig, addOns, services } from "../data/catalogue";
import type { Quote } from "../types";

export function getService(serviceId: string) {
  return services.find((service) => service.id === serviceId) ?? null;
}

export function getAddOns(addOnIds: string[]) {
  return addOns.filter((item) => addOnIds.includes(item.id));
}

export function getDurationMin(serviceId: string, addOnIds: string[]) {
  const service = getService(serviceId);
  if (!service) return 0;

  return (
    service.durationMin +
    service.cleanupBufferMin +
    getAddOns(addOnIds).reduce((sum, item) => sum + item.durationMin, 0)
  );
}

export function getSubtotal(serviceId: string, addOnIds: string[]) {
  const service = getService(serviceId);
  if (!service) return 0;
  return service.price + getAddOns(addOnIds).reduce((sum, item) => sum + item.price, 0);
}

export function createQuote(input: {
  serviceId: string;
  addOnIds: string[];
  startIso: string | null;
}): Quote {
  const subtotal = getSubtotal(input.serviceId, input.addOnIds);
  const durationMin = getDurationMin(input.serviceId, input.addOnIds);
  const deposit =
    subtotal >= bookingConfig.policy.depositThreshold
      ? Math.round(subtotal * bookingConfig.policy.depositRate)
      : 0;

  return {
    subtotal,
    deposit,
    total: subtotal,
    durationMin,
    endIso: input.startIso ? addMinutes(new Date(input.startIso), durationMin).toISOString() : null,
  };
}
