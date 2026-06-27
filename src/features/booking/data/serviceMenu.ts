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

export type ServiceAddOnOption = {
  name: string;
  slug: string;
  imageSrc: string;
  price: string;
  priceValue: number;
  duration: string;
  durationMin: number;
  description: string;
  serviceType: string;
  conflictsWith?: string[];
  exclusiveGroup?: string;
};

const manicureType = "Manicure Service";
const pedicureType = "Pedicure Service";
const enhancementType = "Nail Enhancement";
const addOnType = "Nail Add-on";

export type ServiceArabicCopy = {
  title: string;
  description: string;
};

const defaultServiceArabicCopy: ServiceArabicCopy = {
  title: "خدمة الأظافر",
  description: "خدمة متخصصة للعناية بالأظافر تمنحكِ مظهرًا أنيقًا ومرتبًا.",
};

export const serviceArabicCopyBySlug: Record<string, ServiceArabicCopy> = {
  "broken-tip-repair": {
    title: "إصلاح الظفر المكسور",
    description: "خدمة متخصصة لإصلاح الأظافر المكسورة واستعادة مظهرها الطبيعي بشكل متين وأنيق.",
  },
  chrome: {
    title: "كروم",
    description: "لمسة نهائية لامعة بتأثير معدني عصري تمنح أظافركِ مظهرًا أنيقًا وجذابًا.",
  },
  french: {
    title: "فرنش",
    description: "تصميم كلاسيكي وأنيق يبرز جمال الأظافر بمظهر نظيف وراقٍ يناسب جميع المناسبات.",
  },
  "full-set-builder-gel": {
    title: "طقم كامل بولي جل",
    description: "تقنية متينة لبناء الأظافر تمنحها مظهرًا طبيعيًا وأنيقًا يدوم لفترة طويلة.",
  },
  "full-set-poly-gel": {
    title: "طقم كامل بولي جل",
    description: "تقنية متينة لبناء الأظافر تمنحها مظهرًا طبيعيًا وأنيقًا يدوم لفترة طويلة.",
  },
  "full-set-hard-gel": {
    title: "طقم كامل هارد جل",
    description: "بناء قوي للأظافر باستخدام الهارد جل مع شكل أنيق وثبات طويل.",
  },
  "full-set-fiber": {
    title: "طقم كامل فايبر",
    description: "تقنية تعزز قوة ومتانة الأظافر مع مظهر طبيعي وأنيق يدوم لفترة طويلة.",
  },
  "full-set-gel-extension": {
    title: "طقم كامل جل إكستنشن",
    description: "إطالة الأظافر باستخدام الجل للحصول على شكل أنيق وطول مثالي بمظهر طبيعي وجذاب.",
  },
  "fungal-nail-care-and-treatment": {
    title: "العناية وعلاج فطريات الأظافر",
    description: "عناية متخصصة للمساعدة في تحسين صحة الأظافر والتخفيف من آثار الفطريات واستعادة مظهرها الصحي.",
  },
  "fungal-nail-care-treatment": {
    title: "العناية وعلاج فطريات الأظافر",
    description: "عناية متخصصة للمساعدة في تحسين صحة الأظافر والتخفيف من آثار الفطريات واستعادة مظهرها الصحي.",
  },
  "hard-gel-color": {
    title: "هارد جل مع لون",
    description: "تقوية للأظافر باستخدام الهارد جل مع لون أنيق يمنحها مظهرًا جذابًا وثباتًا طويل الأمد.",
  },
  "massage-scrub-for-hands": {
    title: "مساج وتقشير وبارافين لليدين",
    description: "جلسة متكاملة لتنعيم اليدين وتجديد البشرة مع علاج بارافين مرطب.",
  },
  "massage-scrub-paraffin-hands": {
    title: "سبا اليدين الكامل",
    description: "جلسة متكاملة لتنعيم اليدين وتجديد البشرة مع علاج بارافين مرطب.",
  },
  "nail-design": {
    title: "تصميم الأظافر",
    description: "تصاميم مبتكرة ومخصصة تضيف لمسة فنية فريدة تعكس ذوقكِ وأسلوبكِ الخاص.",
  },
  ombre: {
    title: "أومبري",
    description: "تدرج لوني ناعم وأنيق يمنح الأظافر مظهرًا عصريًا وجذابًا.",
  },
  "paraffin-hand-therapy": {
    title: "علاج اليدين بالبارافين",
    description: "علاج مرطب يساعد على تنعيم البشرة الجافة واستعادة نعومة وراحة اليدين.",
  },
  pose: {
    title: "طلاء الأظافر",
    description: "تطبيق احترافي لطلاء الأظافر يمنحها لونًا متناسقًا ومظهرًا أنيقًا وجذابًا.",
  },
  refill: {
    title: "إعادة تعبئة الأظافر",
    description: "خدمة للحفاظ على جمال ومتانة الأظافر من خلال تجديد النمو وإعادة توازن مظهرها.",
  },
  rubber: {
    title: "روبر بيس",
    description: "طبقة مرنة تساعد على تقوية الأظافر الطبيعية وتحسين ثبات الطلاء مع تقليل التكسر.",
  },
  "rubber-cover-up": {
    title: "روبر بيس مع كوفر أب",
    description: "تقوية للأظافر مع تغطية طبيعية متجانسة تمنحها مظهرًا أنيقًا ومرتبًا يدوم لفترة أطول.",
  },
  "remove-rubber-cover-up": {
    title: "إزالة الروبر مع كوفر أب",
    description: "إزالة الروبر بعناية مع تغطية مرتبة للحصول على مظهر نظيف ومتجانس.",
  },
  "rubber-gel-color": {
    title: "روبر بيس مع لون جل",
    description: "تقوية للأظافر بطبقة مرنة مع لون جل لامع يمنحها مظهرًا جذابًا وثباتًا طويل الأمد.",
  },
  "russian-manicure": {
    title: "المانيكير الكلاسيكي",
    description: "تقنية دقيقة للعناية بالأظافر والجلد المحيط بها تمنح مظهرًا نظيفًا وأنيقًا يدوم لفترة أطول.",
  },
  "classic-manicure": {
    title: "المانيكير الكلاسيكي",
    description: "عناية دقيقة بالأظافر والجلد المحيط بها تمنح مظهرًا نظيفًا وأنيقًا.",
  },
  "soak-off": {
    title: "إزالة الجل",
    description: "إزالة آمنة ولطيفة للجل أو الطلاء شبه الدائم مع الحفاظ على صحة الأظافر الطبيعية.",
  },
  "soak-off-classic-manicure-oil": {
    title: "إزالة الجل مع مانيكير روسي وزيت",
    description: "إزالة لطيفة للمنتج مع مانيكير روسي وزيت مغذٍ للأظافر.",
  },
  "massage-scrub": {
    title: "مساج وتقشير وبارافين",
    description: "جلسة مريحة لتنعيم القدمين وتجديد البشرة مع علاج بارافين مرطب.",
  },
  "pedicure-massage-scrub-paraffin": {
    title: "مساج وتقشير وبارافين",
    description: "جلسة مريحة لتنعيم القدمين وتجديد البشرة مع علاج بارافين مرطب.",
  },
  "pedicure-paraffin-hand-therapy": {
    title: "علاج البارافين",
    description: "علاج مرطب يساعد على تنعيم البشرة الجافة واستعادة نعومة وراحة القدمين.",
  },
  "paraffin-therapy": {
    title: "علاج البارافين",
    description: "علاج مرطب يساعد على تنعيم البشرة الجافة واستعادة نعومة وراحة القدمين.",
  },
  "pedicure-classic-french-manicure": {
    title: "بديكير مع فرنش كلاسيكي",
    description: "عناية متكاملة للقدمين مع تصميم فرنش كلاسيكي يمنح الأظافر مظهرًا أنيقًا ومرتبًا.",
  },
  "pedicure-french": {
    title: "بديكير مع فرنش",
    description: "عناية متكاملة للقدمين مع لمسة فرنش أنيقة تمنح الأظافر مظهرًا نظيفًا وجذابًا.",
  },
  "pedicure-french-gelish": {
    title: "بديكير مع فرنش جيليش",
    description: "عناية متكاملة للقدمين مع فرنش جيليش لامع يدوم طويلًا ويمنح الأظافر مظهرًا أنيقًا ومتألقًا.",
  },
  "pedicure-gel-color-gelish": {
    title: "بديكير مع لون جل",
    description: "عناية متكاملة للقدمين مع لون جل لامع وثابت يمنح الأظافر مظهرًا أنيقًا يدوم لفترة طويلة.",
  },
  "pedicure-gelish": {
    title: "بديكير مع جيليش",
    description: "عناية متكاملة للقدمين مع طلاء جيليش لامع يمنح الأظافر مظهرًا جذابًا وثباتًا يدوم طويلًا.",
  },
  "pedicure-pose": {
    title: "بديكير مع طلاء الأظافر",
    description: "عناية متكاملة للقدمين مع تطبيق احترافي لطلاء الأظافر يمنحها مظهرًا أنيقًا ومرتبًا.",
  },
  "pedicure-fungal-nail-care-treatment": {
    title: "العناية وعلاج فطريات الأظافر",
    description: "عناية متخصصة للمساعدة في تحسين صحة الأظافر والتخفيف من آثار الفطريات واستعادة مظهرها الصحي.",
  },
  "pedicure-fungal-nail-care-and-treatment": {
    title: "العناية وعلاج فطريات الأظافر",
    description: "عناية متخصصة للمساعدة في تحسين صحة الأظافر والتخفيف من آثار الفطريات واستعادة مظهرها الصحي.",
  },
};

export function getServiceArabicCopy(serviceSlug: string): ServiceArabicCopy {
  return serviceArabicCopyBySlug[serviceSlug] ?? defaultServiceArabicCopy;
}

export const manicureServices: ServiceMenuItem[] = [
  { name: "Full Set Poly Gel", slug: "full-set-poly-gel", imageSrc: "/Full%20Set%20Builder%20Gel.png", price: "$45", description: "Full poly gel set for added shape, strength, and length.", duration: "2 hr 30 min", serviceType: enhancementType },
  { name: "Full Set Fiber", slug: "full-set-fiber", imageSrc: "/Full%20Set%20Fiber.png", price: "$50", description: "Full fiber set designed for lightweight strength and a refined finish.", duration: "2 hr 30 min", serviceType: enhancementType },
  { name: "Full Set Hard Gel", slug: "full-set-hard-gel", imageSrc: "/Full%20Set%20Builder%20Gel.png", price: "$45", description: "Full hard gel set built for strong structure and a clean finish.", duration: "2 hr 30 min", serviceType: enhancementType },
  { name: "Fungal Nail Care & Treatment", slug: "fungal-nail-care-treatment", imageSrc: "/Fungal%20Nail%20Care%20%26%20Treatment.png", price: "$20", description: "Focused hand nail care treatment for damaged or problem nails.", duration: "30 min", serviceType: "Nail Treatment" },
  { name: "Hard Gel + Color", slug: "hard-gel-color", imageSrc: "/Hard%20Gel%20%2B%20Color.png", price: "$30", description: "Durable hard gel structure finished with your selected color.", duration: "1 hr 30 min", serviceType: enhancementType },
  { name: "Ultimate Hand Spa", slug: "massage-scrub-paraffin-hands", imageSrc: "/Massage%20%2B%20Scrub%20for%20Hands.png", price: "$25", description: "Hand exfoliation, massage, and warm paraffin hydration in one service.", duration: "45 min", serviceType: "Hand Spa" },
  { name: "Refill", slug: "refill", imageSrc: "/refill.png", price: "$25", description: "Refresh existing nail enhancement growth with balanced structure and finish.", duration: "1 hr 30 min", serviceType: "Nail Maintenance" },
  { name: "Refill Poly Gel", slug: "refill-poly-gel", imageSrc: "/refill.png", price: "$30", description: "Refresh existing poly gel growth with balanced structure and finish.", duration: "2 hr", serviceType: "Nail Maintenance" },
  { name: "Refill Hard Gel", slug: "refill-hard-gel", imageSrc: "/refill.png", price: "$30", description: "Refresh existing hard gel growth with balanced structure and finish.", duration: "2 hr", serviceType: "Nail Maintenance" },
  { name: "Rubber", slug: "rubber", imageSrc: "/Rubber.png", price: "$20", description: "Strengthen natural nails with a flexible rubber base treatment.", duration: "60 min", serviceType: enhancementType },
  { name: "Remove Rubber + Cover Up", slug: "remove-rubber-cover-up", imageSrc: "/Rubber%20%2B%20Cover%20Up.png", price: "$25", description: "Remove rubber base and finish with a smooth cover up.", duration: "60 min", serviceType: "Nail Removal" },
  { name: "Rubber + Gel Color", slug: "rubber-gel-color", imageSrc: "/Rubber%20%2B%20Gel%20Color.png", price: "$25", description: "Strengthen natural nails with rubber base and finish with long-lasting gel color.", duration: "1 hr 30 min", serviceType: enhancementType },
  { name: "Soak Off + Russian Manicure + Oil", slug: "soak-off-classic-manicure-oil", imageSrc: "/Soak%20Off.png", price: "$15", description: "Gentle product removal finished with Russian manicure care and nourishing oil.", duration: "30 min", serviceType: "Nail Removal" },
];

export const pedicureServices: ServiceMenuItem[] = [
  { name: "Pedicure + Pose", slug: "pedicure-pose", imageSrc: "/pedicure/Pedicure%20%2B%20Pose.png", price: "$15", description: "Classic pedicure care finished with a neat pose application.", duration: "1 hr 30 min", serviceType: pedicureType },
  { name: "Pedicure + Classic French", slug: "pedicure-classic-french", imageSrc: "/pedicure/Pedicure%20%2B%20Classic%20French%20Manicure.png", price: "$17", description: "Pedicure care finished with classic French styling.", duration: "1 hr 30 min", serviceType: pedicureType },
  { name: "Pedicure + Gelish", slug: "pedicure-gelish", imageSrc: "/pedicure/Pedicure%20%2B%20Gelish.png", price: "$17", description: "Relaxed pedicure care with glossy Gelish polish.", duration: "2 hr", serviceType: pedicureType },
  { name: "Pedicure + French Gelish", slug: "pedicure-french-gelish", imageSrc: "/pedicure/Pedicure%20%2B%20French%20Gelish.png", price: "$20", description: "French pedicure styling with the durability of Gelish polish.", duration: "2 hr", serviceType: pedicureType },
  { name: "Pedicure + Ombré", slug: "pedicure-ombre", imageSrc: "/pedicure/Pedicure%20%2B%20French.png", price: "$20", description: "Pedicure care finished with a soft ombré color blend.", duration: "2 hr", serviceType: pedicureType },
  { name: "Massage + Scrub + Paraffin", slug: "pedicure-massage-scrub-paraffin", imageSrc: "/pedicure/Massage%20%2B%20Scrub.png", price: "$20", description: "Foot scrub, massage, and paraffin hydration in one service.", duration: "45 min", serviceType: "Foot Spa" },
  { name: "Fungal Nail Care & Treatment", slug: "pedicure-fungal-nail-care-treatment", imageSrc: "/pedicure/Fungal%20Nail%20Care%20%26%20Treatment.png", price: "$35", description: "Focused foot nail care treatment for damaged or problem nails.", duration: "1 hr 15 min", serviceType: "Nail Treatment" },
];

const slugAliases: Record<string, string> = {
  "russian-manicure": "classic-manicure",
  "full-set-builder-gel": "full-set-poly-gel",
  "rubber-cover-up": "remove-rubber-cover-up",
  "soak-off": "soak-off-classic-manicure-oil",
  "massage-scrub-for-hands": "massage-scrub-paraffin-hands",
  "paraffin-hand-therapy": "massage-scrub-paraffin-hands",
  "pedicure-classic-french-manicure": "pedicure-classic-french",
  "pedicure-french": "pedicure-classic-french",
  "pedicure-gel-color-gelish": "pedicure-gelish",
  "massage-scrub": "pedicure-massage-scrub-paraffin",
  "pedicure-paraffin-hand-therapy": "pedicure-massage-scrub-paraffin",
};

const manicureCanonicalServices = new Map(manicureServices.map((service) => [service.slug, service]));
const pedicureCanonicalServices = new Map(pedicureServices.map((service) => [service.slug, service]));

export function getCanonicalServiceSlug(slug: string) {
  return slugAliases[slug] ?? slug;
}

function getCanonicalService(groupId: ServiceGroupId, slug: string) {
  const canonicalSlug = getCanonicalServiceSlug(slug);
  const serviceMap = groupId === "pedicure" ? pedicureCanonicalServices : manicureCanonicalServices;
  return serviceMap.get(canonicalSlug) ?? null;
}

export function normalizeServiceMenuItem(service: ServiceMenuItem, groupId: ServiceGroupId): ServiceMenuItem {
  const canonical = getCanonicalService(groupId, service.slug);
  if (!canonical) return service;

  return {
    ...service,
    ...canonical,
    id: service.id,
    description: canonical.description,
  };
}

const addOnOptions: Record<string, ServiceAddOnOption> = {
  "broken-tip-repair": {
    name: "Broken Tip Repair",
    slug: "broken-tip-repair",
    imageSrc: "/Broken%20Tip%20Repair.png",
    price: "$1.50",
    priceValue: 1.5,
    duration: "10 min",
    durationMin: 10,
    description: "Repair one damaged nail tip before the finish.",
    serviceType: "Nail Repair",
  },
  chrome: {
    name: "Chrome",
    slug: "chrome",
    imageSrc: "/Chrome.png",
    price: "$5",
    priceValue: 5,
    duration: "10 min",
    durationMin: 10,
    description: "Reflective chrome finish.",
    serviceType: addOnType,
  },
  french: {
    name: "French",
    slug: "french",
    imageSrc: "/French.png",
    price: "$5",
    priceValue: 5,
    duration: "20 min",
    durationMin: 20,
    description: "Classic French tips.",
    serviceType: addOnType,
    conflictsWith: ["ombre"],
  },
  ombre: {
    name: "Ombré",
    slug: "ombre",
    imageSrc: "/Ombr%C3%A9.png",
    price: "$5",
    priceValue: 5,
    duration: "20 min",
    durationMin: 20,
    description: "Soft blended ombré finish.",
    serviceType: addOnType,
    conflictsWith: ["french"],
  },
  "nail-design": {
    name: "Nail Design",
    slug: "nail-design",
    imageSrc: "/Nail%20Design.png",
    price: "From $2",
    priceValue: 2,
    duration: "10 min",
    durationMin: 10,
    description: "Custom nail detail.",
    serviceType: "Nail Art",
  },
  "gel-color": {
    name: "Gel Color",
    slug: "gel-color",
    imageSrc: "/Rubber%20%2B%20Gel%20Color.png",
    price: "$5",
    priceValue: 5,
    duration: "30 min",
    durationMin: 30,
    description: "Long-lasting gel color finish.",
    serviceType: addOnType,
  },
  "massage-scrub-paraffin-hands": {
    name: "Ultimate Hand Spa",
    slug: "massage-scrub-paraffin-hands",
    imageSrc: "/Massage%20%2B%20Scrub%20for%20Hands.png",
    price: "$25",
    priceValue: 25,
    duration: "45 min",
    durationMin: 45,
    description: "Hand massage, scrub, and paraffin therapy.",
    serviceType: "Hand Spa",
  },
  "classic-manicure-mini": {
    name: "Classic Manicure",
    slug: "classic-manicure-mini",
    imageSrc: "/Russian%20Manicure.png",
    price: "$5",
    priceValue: 5,
    duration: "10 min",
    durationMin: 10,
    description: "Quick classic manicure prep.",
    serviceType: manicureType,
  },
  "pose-french": {
    name: "French",
    slug: "pose-french",
    imageSrc: "/French.png",
    price: "$2",
    priceValue: 2,
    duration: "10 min",
    durationMin: 10,
    description: "French finish for pose.",
    serviceType: addOnType,
    exclusiveGroup: "pose-finish",
  },
  "pose-design": {
    name: "Design",
    slug: "pose-design",
    imageSrc: "/Nail%20Design.png",
    price: "$2",
    priceValue: 2,
    duration: "10 min",
    durationMin: 10,
    description: "Simple design for pose.",
    serviceType: "Nail Art",
    exclusiveGroup: "pose-finish",
  },
};

const fullSetAddOns = ["chrome", "french", "ombre", "massage-scrub-paraffin-hands", "nail-design", "gel-color"];
const enhancementAddOns = [...fullSetAddOns, "broken-tip-repair"];

const manicureAddOnsByService: Record<string, string[]> = {
  "classic-manicure": ["broken-tip-repair", "chrome", "french", "ombre", "nail-design"],
  pose: ["classic-manicure-mini", "pose-design", "pose-french"],
  rubber: enhancementAddOns,
  "rubber-gel-color": enhancementAddOns,
  "hard-gel-color": enhancementAddOns,
  refill: enhancementAddOns,
  "refill-poly-gel": enhancementAddOns,
  "refill-hard-gel": enhancementAddOns,
  "full-set-gel-extension": fullSetAddOns,
  "full-set-fiber": fullSetAddOns,
  "full-set-poly-gel": fullSetAddOns,
  "full-set-hard-gel": fullSetAddOns,
  chrome: ["classic-manicure", "rubber", "rubber-gel-color", "hard-gel-color", "refill", "refill-poly-gel", "refill-hard-gel", "full-set-gel-extension", "full-set-fiber", "full-set-poly-gel", "full-set-hard-gel", "french", "ombre", "nail-design"],
  french: ["classic-manicure", "rubber", "rubber-gel-color", "hard-gel-color", "refill", "refill-poly-gel", "refill-hard-gel", "full-set-gel-extension", "full-set-fiber", "full-set-poly-gel", "full-set-hard-gel", "chrome", "nail-design"],
  ombre: ["classic-manicure", "rubber", "rubber-gel-color", "hard-gel-color", "refill", "refill-poly-gel", "refill-hard-gel", "full-set-gel-extension", "full-set-fiber", "full-set-poly-gel", "full-set-hard-gel", "chrome", "nail-design"],
  "nail-design": ["classic-manicure", "rubber", "rubber-gel-color", "hard-gel-color", "refill", "refill-poly-gel", "refill-hard-gel", "full-set-gel-extension", "full-set-fiber", "full-set-poly-gel", "full-set-hard-gel", "chrome", "french", "ombre"],
  "broken-tip-repair": ["classic-manicure", "rubber", "rubber-gel-color", "hard-gel-color", "refill", "refill-poly-gel", "refill-hard-gel", "chrome", "french", "ombre", "nail-design"],
};

const standaloneServiceSlugs = new Set([
  "fungal-nail-care-treatment",
  "remove-rubber-cover-up",
  "soak-off-classic-manicure-oil",
  "massage-scrub-paraffin-hands",
  "pedicure-fungal-nail-care-treatment",
  "pedicure-massage-scrub-paraffin",
]);

export function getServiceAddOns(groupId: ServiceGroupId, serviceSlug: string): ServiceAddOnOption[] {
  const slug = getCanonicalServiceSlug(serviceSlug);
  if (groupId === "pedicure" || standaloneServiceSlugs.has(slug)) return [];

  return (manicureAddOnsByService[slug] ?? [])
    .map((addOnSlug) => {
      const existingAddOn = addOnOptions[addOnSlug];
      if (existingAddOn) return existingAddOn;

      const service = manicureCanonicalServices.get(addOnSlug);
      if (!service) return null;

      return {
        ...service,
        priceValue: parseServicePrice(service.price),
        durationMin: parseServiceDuration(service.duration),
        conflictsWith: service.slug === "french" ? ["ombre"] : service.slug === "ombre" ? ["french"] : undefined,
      };
    })
    .filter((addOn): addOn is ServiceAddOnOption => Boolean(addOn));
}

export function getServiceInclusions(serviceSlug: string) {
  const slug = getCanonicalServiceSlug(serviceSlug);
  if (["full-set-gel-extension", "full-set-fiber", "full-set-poly-gel", "full-set-hard-gel"].includes(slug)) {
    return ["Classic manicure included"];
  }

  return [];
}

export function parseServicePrice(price: string) {
  const match = price.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

export function parseServiceDuration(duration: string) {
  const normalized = duration.toLowerCase();
  let minutes = 0;
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour)/);
  const minuteMatch = normalized.match(/(\d+)\s*min/);

  if (hourMatch) minutes += Number(hourMatch[1]) * 60;
  if (minuteMatch) minutes += Number(minuteMatch[1]);
  if (!hourMatch && !minuteMatch) {
    const numeric = normalized.match(/\d+/);
    if (numeric) minutes = Number(numeric[0]);
  }

  return minutes;
}

export function formatServiceDuration(totalMinutes: number) {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

export const serviceGroups = {
  manicure: manicureServices,
  pedicure: pedicureServices,
} as const;

export type ServiceGroupId = keyof typeof serviceGroups;

export function isPrimaryServiceSlug(groupId: ServiceGroupId, serviceSlug: string) {
  const canonicalSlug = getCanonicalServiceSlug(serviceSlug);
  return serviceGroups[groupId].some((service) => service.slug === canonicalSlug);
}

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
  const canonicalSlug = getCanonicalServiceSlug(slug);
  const knownService = [...manicureServices, ...pedicureServices].find((service) => service.slug === canonicalSlug);

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
  const canonicalSlug = serviceSlug ? getCanonicalServiceSlug(serviceSlug) : undefined;
  return services.find((service) => service.slug === canonicalSlug || getCanonicalServiceSlug(service.slug) === canonicalSlug) ?? null;
}

export function getServiceBySlug(groupId: string | undefined, serviceSlug: string | undefined) {
  if (groupId !== "manicure" && groupId !== "pedicure") return null;
  return getServiceBySlugFromList([...serviceGroups[groupId]], serviceSlug);
}
