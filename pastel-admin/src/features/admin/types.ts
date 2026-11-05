export const appointmentStatuses = ["booked", "confirmed", "completed", "cancelled", "no_show"] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export const editableAppointmentStatuses = ["booked", "confirmed", "cancelled"] as const;

export type EditableAppointmentStatus = (typeof editableAppointmentStatuses)[number];

export const appointmentViews = ["upcoming", "today", "tomorrow", "week", "past"] as const;

export type AppointmentView = (typeof appointmentViews)[number];

export type AdminSelectedService = {
  id?: string | null;
  slug?: string | null;
  kind?: "service" | "add_on" | string | null;
  name: string;
  price?: number | string | null;
  duration_minutes?: number | null;
};

export type AdminAppointment = {
  id: string;
  customerFullName: string;
  customerPhone: string;
  selectedServices: AdminSelectedService[];
  /** Salon wall-clock date, YYYY-MM-DD. */
  dateKey: string;
  appointmentTime: string;
  totalPrice: number;
  totalDurationMinutes: number;
  status: AppointmentStatus;
};

export type AdminAppointmentFilters = {
  view: AppointmentView;
  /** A specific YYYY-MM-DD day. Overrides `view` when set. A search looks across all dates instead. */
  date: string;
  status: AppointmentStatus | "";
  search: string;
};
