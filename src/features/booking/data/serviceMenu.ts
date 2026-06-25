export type ServiceMenuItem = {
  id?: string;
  name: string;
  slug: string;
  imageSrc: string;
  price: string;
  description: string;
  duration: string;
  serviceType: string;
};

const manicureType = "Manicure Service";
const pedicureType = "Pedicure Service";

export const manicureServices: ServiceMenuItem[] = [
  { name: "Russian Manicure", slug: "russian-manicure", imageSrc: "/Russian%20Manicure.png", price: "$25", description: "Detailed cuticle work and clean shaping for a polished natural nail finish.", duration: "60 min", serviceType: manicureType },
  { name: "Pose", slug: "pose", imageSrc: "/Pose.png", price: "$20", description: "A neat nail application service finished with a clean salon look.", duration: "45 min", serviceType: manicureType },
  { name: "Rubber", slug: "rubber", imageSrc: "/Rubber.png", price: "$20", description: "Strengthen natural nails with a flexible rubber base treatment.", duration: "50 min", serviceType: "Nail Enhancement" },
  { name: "Rubber + Cover Up", slug: "rubber-cover-up", imageSrc: "/Rubber%20%2B%20Cover%20Up.png", price: "$25", description: "Rubber base with soft coverage for a smooth, even nail finish.", duration: "60 min", serviceType: "Nail Enhancement" },
  { name: "Hard Gel + Color", slug: "hard-gel-color", imageSrc: "/Hard%20Gel%20%2B%20Color.png", price: "$30", description: "Durable hard gel structure finished with your selected color.", duration: "75 min", serviceType: "Nail Enhancement" },
  { name: "Rubber + Gel Color", slug: "rubber-gel-color", imageSrc: "/Rubber%20%2B%20Gel%20Color.png", price: "$25", description: "Strengthen natural nails with rubber base and finish with long-lasting gel color.", duration: "60 min", serviceType: "Nail Enhancement" },
  { name: "Refill", slug: "refill", imageSrc: "/refill.png", price: "$25", description: "Refresh existing nail enhancement growth with balanced structure and finish.", duration: "60 min", serviceType: "Nail Maintenance" },
  { name: "Broken Tip Repair", slug: "broken-tip-repair", imageSrc: "/Broken%20Tip%20Repair.png", price: "$5", description: "Repair a damaged or broken nail tip with careful shaping and finish.", duration: "20 min", serviceType: "Nail Repair" },
  { name: "Soak Off", slug: "soak-off", imageSrc: "/Soak%20Off.png", price: "$10", description: "Gentle product removal to protect the natural nail surface.", duration: "30 min", serviceType: "Nail Removal" },
  { name: "French", slug: "french", imageSrc: "/French.png", price: "$5", description: "Classic French tips for a clean, elegant nail finish.", duration: "20 min", serviceType: "Nail Add-on" },
  { name: "Ombré", slug: "ombre", imageSrc: "/Ombr%C3%A9.png", price: "$10", description: "Soft blended color fade for a polished ombré effect.", duration: "25 min", serviceType: "Nail Add-on" },
  { name: "Chrome", slug: "chrome", imageSrc: "/Chrome.png", price: "$10", description: "Reflective chrome finish added over your selected nail service.", duration: "20 min", serviceType: "Nail Add-on" },
  { name: "Full Set Builder Gel", slug: "full-set-builder-gel", imageSrc: "/Full%20Set%20Builder%20Gel.png", price: "$40", description: "Full builder gel set for added shape, strength, and length.", duration: "90 min", serviceType: "Nail Enhancement" },
  { name: "Full Set Fiber", slug: "full-set-fiber", imageSrc: "/Full%20Set%20Fiber.png", price: "$45", description: "Full fiber set designed for lightweight strength and a refined finish.", duration: "90 min", serviceType: "Nail Enhancement" },
  { name: "Full Set Gel Extension", slug: "full-set-gel-extension", imageSrc: "/Full%20Set%20Gel%20Extension.png", price: "$45", description: "Gel extensions shaped and finished for an elegant full set.", duration: "95 min", serviceType: "Nail Extension" },
  { name: "Massage + Scrub for Hands", slug: "massage-scrub-for-hands", imageSrc: "/Massage%20%2B%20Scrub%20for%20Hands.png", price: "$15", description: "Hand exfoliation and massage for softer, refreshed skin.", duration: "25 min", serviceType: "Hand Spa" },
  { name: "Nail Design", slug: "nail-design", imageSrc: "/Nail%20Design.png", price: "$10", description: "Custom nail detail added to personalize your manicure.", duration: "25 min", serviceType: "Nail Art" },
  { name: "Fungal Nail Care & Treatment", slug: "fungal-nail-care-treatment", imageSrc: "/Fungal%20Nail%20Care%20%26%20Treatment.png", price: "$35", description: "Focused nail care treatment for damaged or problem nails.", duration: "45 min", serviceType: "Nail Treatment" },
  { name: "Paraffin Hand Therapy", slug: "paraffin-hand-therapy", imageSrc: "/Paraffin%20Hand%20Therapy.png", price: "$15", description: "Warm paraffin therapy to deeply soften and hydrate the hands.", duration: "25 min", serviceType: "Hand Spa" },
];

export const pedicureServices: ServiceMenuItem[] = [
  { name: "Pedicure + Pose", slug: "pedicure-pose", imageSrc: "/pedicure/Pedicure%20%2B%20Pose.png", price: "$25", description: "Classic pedicure care finished with a neat pose application.", duration: "60 min", serviceType: pedicureType },
  { name: "Pedicure + Gel Color (Gelish)", slug: "pedicure-gel-color-gelish", imageSrc: "/pedicure/Pedicure%20%2B%20Gel%20Color%20(Gelish).png", price: "$30", description: "Pedicure care with long-lasting Gelish color for a polished finish.", duration: "70 min", serviceType: pedicureType },
  { name: "Pedicure + French", slug: "pedicure-french", imageSrc: "/pedicure/Pedicure%20%2B%20French.png", price: "$28", description: "Fresh pedicure service finished with clean French tips.", duration: "65 min", serviceType: pedicureType },
  { name: "Pedicure + Classic French Manicure", slug: "pedicure-classic-french-manicure", imageSrc: "/pedicure/Pedicure%20%2B%20Classic%20French%20Manicure.png", price: "$35", description: "Complete classic French styling for feet and hands.", duration: "90 min", serviceType: pedicureType },
  { name: "Pedicure + Gelish", slug: "pedicure-gelish", imageSrc: "/pedicure/Pedicure%20%2B%20Gelish.png", price: "$30", description: "Relaxed pedicure care with glossy Gelish polish.", duration: "70 min", serviceType: pedicureType },
  { name: "Pedicure + French Gelish", slug: "pedicure-french-gelish", imageSrc: "/pedicure/Pedicure%20%2B%20French%20Gelish.png", price: "$35", description: "French pedicure styling with the durability of Gelish polish.", duration: "75 min", serviceType: pedicureType },
  { name: "Massage + Scrub", slug: "massage-scrub", imageSrc: "/pedicure/Massage%20%2B%20Scrub.png", price: "$15", description: "Foot scrub and massage for soft, refreshed skin.", duration: "25 min", serviceType: "Foot Spa" },
  { name: "Paraffin Hand Therapy", slug: "pedicure-paraffin-hand-therapy", imageSrc: "/pedicure/Paraffin%20Hand%20Therapy.png", price: "$15", description: "Warm paraffin therapy to hydrate and soften dry skin.", duration: "25 min", serviceType: "Spa Therapy" },
  { name: "Fungal Nail Care & Treatment", slug: "pedicure-fungal-nail-care-treatment", imageSrc: "/pedicure/Fungal%20Nail%20Care%20%26%20Treatment.png", price: "$35", description: "Focused foot nail care treatment for damaged or problem nails.", duration: "45 min", serviceType: "Nail Treatment" },
];

export const serviceGroups = {
  manicure: manicureServices,
  pedicure: pedicureServices,
} as const;

export type ServiceGroupId = keyof typeof serviceGroups;

export function getServiceSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getServiceImage(name: string, categoryName = "") {
  const slug = getServiceSlug(name);
  const knownService = [...manicureServices, ...pedicureServices].find((service) => service.slug === slug);

  if (knownService) return knownService.imageSrc;

  const isPedicure = categoryName.toLowerCase().includes("pedicure");
  const pedicureImageAliases: Record<string, string> = {
    "paraffin-therapy": "/pedicure/Paraffin%20Hand%20Therapy.png",
    "pedicure-gel-color": "/pedicure/Pedicure%20%2B%20Gel%20Color%20(Gelish).png",
  };

  if (isPedicure && pedicureImageAliases[slug]) {
    return pedicureImageAliases[slug];
  }

  const folder = isPedicure ? "/pedicure/" : "/";
  return `${folder}${encodeURIComponent(name)}.png`;
}

export function getOptimizedServiceImage(imageSrc: string) {
  const [path, query = ""] = imageSrc.split("?");
  const optimizedPath = `/optimized${path.replace(/\.png$/i, ".webp")}`;
  return query ? `${optimizedPath}?${query}` : optimizedPath;
}

export function getServiceBySlugFromList(services: ServiceMenuItem[], serviceSlug: string | undefined) {
  return services.find((service) => service.slug === serviceSlug) ?? null;
}

export function getServiceBySlug(groupId: string | undefined, serviceSlug: string | undefined) {
  if (groupId !== "manicure" && groupId !== "pedicure") return null;
  return getServiceBySlugFromList([...serviceGroups[groupId]], serviceSlug);
}
