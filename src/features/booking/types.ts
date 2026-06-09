export type BookingStep = "service" | "schedule" | "review";

export type ServiceCategory = "nails" | "pedicure" | "facial";

export type AddOn = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  compatibleServiceIds: string[];
};

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  durationMin: number;
  cleanupBufferMin: number;
  allowsProcessingGap?: boolean;
  accent: string;
  featuredNote: string;
};

export type TimeOffWindow = {
  startIso: string;
  endIso: string;
  reason: string;
};

export type WeeklyHours = {
  weekday: number;
  start: string;
  end: string;
};

export type BreakWindow = {
  weekday: number;
  start: string;
  end: string;
};

export type Staff = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  bio: string;
  supportedServiceIds: string[];
  supportedAddOnIds: string[];
  weeklyHours: WeeklyHours[];
  breakWindows: BreakWindow[];
  timeOff: TimeOffWindow[];
};

export type BookingStatus = "confirmed" | "cancelled";

export type BookingPolicy = {
  freeChangeHours: number;
  cancellationWindowHours: number;
  depositThreshold: number;
  depositRate: number;
  onlineLeadMinutes: number;
};

export type BookingConfig = {
  locale: string;
  salonTimezone: string;
  currency: "GBP";
  policy: BookingPolicy;
  contactEmail: string;
  contactPhone: string;
};

export type BookingGuest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  consent: boolean;
};

export type Booking = {
  code: string;
  status: BookingStatus;
  serviceId: string;
  addOnIds: string[];
  staffId: string;
  startIso: string;
  endIso: string;
  timezone: string;
  subtotal: number;
  deposit: number;
  total: number;
  durationMin: number;
  guest: BookingGuest;
  createdAtIso: string;
};

export type DraftBooking = {
  serviceId: string | null;
  addOnIds: string[];
  staffId: string | null;
  selectedDate: string | null;
  selectedSlotIso: string | null;
  guest: BookingGuest;
};

export type Quote = {
  subtotal: number;
  deposit: number;
  total: number;
  durationMin: number;
  endIso: string | null;
};

export type AvailabilitySlot = {
  startIso: string;
  endIso: string;
  staffId: string;
  label: string;
  period: "Morning" | "Afternoon" | "Evening";
};

export type DayAvailability = {
  dateIso: string;
  slots: AvailabilitySlot[];
  suggestions: AvailabilitySlot[];
};

export type AvailabilityResponse = {
  timezone: string;
  dateIso: string;
  slots: AvailabilitySlot[];
  nearbyDates: string[];
  suggestions: AvailabilitySlot[];
  alternativeStaffIds: string[];
};

export type ServiceOption = {
  service: Service;
  addOns: AddOn[];
};

export type BookingApi = {
  getConfig: () => Promise<BookingConfig>;
  getServices: () => Promise<ServiceOption[]>;
  getStaff: (input: { serviceId: string; addOnIds: string[] }) => Promise<Staff[]>;
  getAvailability: (input: {
    serviceId: string;
    addOnIds: string[];
    staffId: string | null;
    date: string;
    timezone: string;
  }) => Promise<AvailabilityResponse>;
  quoteBooking: (input: {
    serviceId: string;
    addOnIds: string[];
    startIso: string | null;
  }) => Promise<Quote>;
  createBooking: (input: {
    serviceId: string;
    addOnIds: string[];
    staffId: string;
    startIso: string;
    guest: BookingGuest;
  }) => Promise<Booking>;
  getBooking: (code: string) => Promise<Booking | null>;
  rescheduleBooking: (input: {
    code: string;
    staffId: string;
    startIso: string;
  }) => Promise<Booking>;
  cancelBooking: (code: string) => Promise<Booking>;
};
