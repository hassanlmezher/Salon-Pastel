export const appointmentStatuses = ["booked", "confirmed", "completed", "cancelled", "no_show"] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

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
  customerFirstName: string;
  customerLastName: string;
  customerFullName: string;
  customerPhone: string;
  selectedServices: AdminSelectedService[];
  appointmentDate: string;
  appointmentTime: string;
  appointmentStart: string;
  totalPrice: number;
  totalDurationMinutes: number;
  status: AppointmentStatus;
};

export type AdminAppointmentFilters = {
  date?: string;
  status?: AppointmentStatus | "";
  search?: string;
};
