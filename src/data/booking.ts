import type { DateAvailability, Service } from "../types";

export const services: Service[] = [
  {
    id: "classic-manicure",
    name: "Classic Manicure",
    description:
      "Detailed shaping, cuticle nourishment, and a polished finish with our premium palette.",
    price: 45,
    duration: 45,
    accent: "For clean elegance",
    icon: "manicure",
  },
  {
    id: "deluxe-pedicure",
    name: "Deluxe Pedicure",
    description:
      "A sea-salt soak, restorative exfoliation, and deep hydration for an unhurried reset.",
    price: 55,
    duration: 60,
    accent: "Restorative ritual",
    icon: "pedicure",
  },
  {
    id: "gel-color-overlay",
    name: "Gel Color Overlay",
    description:
      "High-gloss designer gel color with long-wear resilience and a refined natural shape.",
    price: 60,
    duration: 75,
    accent: "Long-wear shine",
    icon: "gel",
  },
  {
    id: "artistic-detailing",
    name: "Artistic Detailing",
    description:
      "Hand-painted accents or minimalist metallic linework to elevate your signature finish.",
    price: 20,
    duration: 30,
    accent: "Add-on artistry",
    icon: "detail",
  },
  {
    id: "signature-skin-facial",
    name: "Signature Skin Facial",
    description:
      "A calming 90-minute facial with tailored botanicals, sculpting massage, and luminous hydration.",
    price: 185,
    duration: 90,
    accent: "House signature",
    icon: "facial",
  },
];

export const availability: DateAvailability[] = [
  {
    iso: "2026-06-10",
    slots: [
      { period: "Morning", times: ["9:00 AM", "10:30 AM", "11:45 AM"] },
      { period: "Afternoon", times: ["1:15 PM", "2:30 PM", "4:00 PM"] },
    ],
  },
  {
    iso: "2026-06-11",
    slots: [
      { period: "Morning", times: ["10:00 AM", "11:00 AM"] },
      { period: "Afternoon", times: ["1:30 PM", "3:00 PM", "4:30 PM"] },
      { period: "Evening", times: ["6:00 PM"] },
    ],
  },
  {
    iso: "2026-06-14",
    slots: [
      { period: "Morning", times: ["9:30 AM", "11:15 AM"] },
      { period: "Afternoon", times: ["1:00 PM", "2:15 PM", "3:45 PM"] },
    ],
  },
  {
    iso: "2026-06-17",
    slots: [
      { period: "Morning", times: ["10:15 AM", "11:30 AM"] },
      { period: "Afternoon", times: ["1:45 PM", "3:15 PM"] },
      { period: "Evening", times: ["5:30 PM", "6:45 PM"] },
    ],
  },
  {
    iso: "2026-06-21",
    slots: [
      { period: "Morning", times: ["9:00 AM", "10:00 AM", "11:30 AM"] },
      { period: "Afternoon", times: ["1:00 PM", "2:00 PM", "3:30 PM"] },
    ],
  },
  {
    iso: "2026-06-24",
    slots: [
      { period: "Morning", times: ["9:45 AM", "11:00 AM"] },
      { period: "Afternoon", times: ["12:30 PM", "2:15 PM", "4:15 PM"] },
      { period: "Evening", times: ["5:45 PM"] },
    ],
  },
  {
    iso: "2026-06-27",
    slots: [
      { period: "Morning", times: ["10:30 AM"] },
      { period: "Afternoon", times: ["1:30 PM", "3:00 PM", "4:30 PM"] },
    ],
  },
  {
    iso: "2026-07-02",
    slots: [
      { period: "Morning", times: ["9:00 AM", "10:30 AM"] },
      { period: "Afternoon", times: ["1:15 PM", "2:45 PM"] },
      { period: "Evening", times: ["5:30 PM", "6:30 PM"] },
    ],
  },
  {
    iso: "2026-07-05",
    slots: [
      { period: "Morning", times: ["10:00 AM", "11:15 AM"] },
      { period: "Afternoon", times: ["12:45 PM", "2:00 PM", "3:30 PM"] },
    ],
  },
  {
    iso: "2026-07-09",
    slots: [
      { period: "Morning", times: ["9:15 AM", "10:45 AM"] },
      { period: "Afternoon", times: ["1:00 PM", "2:30 PM", "4:00 PM"] },
      { period: "Evening", times: ["6:15 PM"] },
    ],
  },
];

export const availableDateMap = new Map(
  availability.map((entry) => [entry.iso, entry]),
);
