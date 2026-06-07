export type BookingStep = 0 | 1 | 2 | 3;

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  accent: string;
  icon: "manicure" | "pedicure" | "gel" | "detail" | "facial";
};

export type TimePeriod = "Morning" | "Afternoon" | "Evening";

export type DateAvailability = {
  iso: string;
  slots: {
    period: TimePeriod;
    times: string[];
  }[];
};
