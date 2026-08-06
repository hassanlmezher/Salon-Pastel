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
  fungal: {
    title: "العناية وعلاج فطريات الأظافر",
    description: "عناية متخصصة للمساعدة في تحسين صحة الأظافر والتخفيف من آثار الفطريات واستعادة مظهرها الصحي.",
  },
  "hard-gel-color": {
    title: "هارد جل مع لون",
    description: "تقوية للأظافر باستخدام الهارد جل مع لون أنيق يمنحها مظهرًا جذابًا وثباتًا طويل الأمد.",
  },
  "massage-scrub-for-hands": {
    title: "سبا فاخر لليدين",
    description: "جلسة متكاملة تشمل المساج والتقشير وعلاج البارافين لتنعيم اليدين وترطيبهما.",
  },
  "massage-scrub-paraffin-hands": {
    title: "سبا فاخر لليدين",
    description: "جلسة متكاملة تشمل المساج والتقشير وعلاج البارافين لتنعيم اليدين وترطيبهما.",
  },
  "luxury-spa-for-hands": {
    title: "سبا فاخر لليدين",
    description: "جلسة متكاملة تشمل المساج والتقشير وعلاج البارافين لتنعيم اليدين وترطيبهما.",
  },
  "luxury-spa-for-legs": {
    title: "سبا فاخر للساقين",
    description: "جلسة متكاملة تشمل المساج والتقشير وعلاج البارافين لتنعيم القدمين والساقين وترطيبهما.",
  },
  "nail-design": {
    title: "تصميم الأظافر",
    description: "تصاميم مبتكرة ومخصصة تضيف لمسة فنية فريدة تعكس ذوقكِ وأسلوبكِ الخاص.",
  },
  ombre: {
    title: "أومبري",
    description: "تدرج لوني ناعم وأنيق يمنح الأظافر مظهرًا عصريًا وجذابًا.",
  },
  "pedicure-ombre": {
    title: "بديكير مع أومبري",
    description: "عناية متكاملة للقدمين مع تدرج لوني ناعم وأنيق يمنح الأظافر مظهرًا عصريًا وجذابًا.",
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
    title: "مساج وتقشير لليدين",
    description: "جلسة مريحة تساعد على تنعيم اليدين وتجديد البشرة ومنحهما إحساسًا بالانتعاش.",
  },
  "pedicure-massage-scrub-paraffin": {
    title: "بديكير فاخر مع مساج وتقشير",
    description: "جلسة بديكير فاخرة مع مساج وتقشير لتنعيم القدمين وتجديد البشرة.",
  },
  "luxury-pedicure-massage-scrub": {
    title: "بديكير فاخر مع مساج وتقشير",
    description: "جلسة بديكير فاخرة مع مساج وتقشير لتنعيم القدمين وتجديد البشرة.",
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
  "pedicure-classic-french": {
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
  "pedicure-gel-color": {
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
  { name: "Full Set Poly Gel", slug: "full-set-poly-gel", imageSrc: "/Full%20Set%20Poly%20Gel.png", price: "$45", description: "Full poly gel set for added shape, strength, and length.", duration: "2 hr", serviceType: enhancementType },
  { name: "Full Set Hard Gel", slug: "full-set-hard-gel", imageSrc: "/Full%20Set%20Hard%20Gel.png", price: "$45", description: "Full hard gel set built for strong structure and a clean finish.", duration: "2 hr", serviceType: enhancementType },
  { name: "Full Set Gel Extension", slug: "full-set-gel-extension", imageSrc: "/Full%20Set%20Gel%20Extension.png", price: "$35", description: "Gel extensions shaped and finished for an elegant full set.", duration: "2 hr", serviceType: "Nail Extension" },
  { name: "Full Set Fiber", slug: "full-set-fiber", imageSrc: "/Full%20Set%20Fiber.png", price: "$50", description: "Full fiber set designed for lightweight strength and a refined finish.", duration: "2 hr 30 min", serviceType: enhancementType },
  { name: "Hard Gel + Color", slug: "hard-gel-color", imageSrc: "/services/manicure/hard-gel-color.png", price: "$30", description: "Durable hard gel structure finished with your selected color.", duration: "1 hr 30 min", serviceType: enhancementType },
  { name: "Rubber + Gel Color", slug: "rubber-gel-color", imageSrc: "/services/manicure/rubber-gel-color.png", price: "$25", description: "Strengthen natural nails with rubber base and finish with long-lasting gel color.", duration: "1 hr 30 min", serviceType: enhancementType },
  { name: "Rubber + Cover Up", slug: "rubber-cover-up", imageSrc: "/services/manicure/rubber-cover-up.png", price: "$25", description: "Rubber base with soft coverage for a smooth, even nail finish.", duration: "60 min", serviceType: enhancementType },
  { name: "Refill", slug: "refill", imageSrc: "/refill.png", price: "$25", description: "Refresh existing nail enhancement growth with balanced structure and finish.", duration: "1 hr 30 min", serviceType: "Nail Maintenance" },
  { name: "Rubber", slug: "rubber", imageSrc: "/Rubber.png", price: "$20", description: "Strengthen natural nails with a flexible rubber base treatment.", duration: "60 min", serviceType: enhancementType },
  { name: "Classic Manicure", slug: "classic-manicure", imageSrc: "/Russian%20Manicure.png", price: "$25", description: "Detailed cuticle work and clean shaping for a polished natural nail finish.", duration: "60 min", serviceType: manicureType },
  { name: "Pose", slug: "pose", imageSrc: "/Pose.png", price: "$10", description: "A neat nail application service finished with a clean salon look.", duration: "30 min", serviceType: manicureType },
  { name: "Fungal", slug: "fungal", imageSrc: "/Fungal%20Nail%20Care%20%26%20Treatment.png", price: "$20", description: "Focused hand nail care treatment for damaged or problem nails.", duration: "30 min", serviceType: "Nail Treatment" },
  { name: "Luxury Spa for Hands", slug: "luxury-spa-for-hands", imageSrc: "/services/manicure/massage-scrub.png", price: "$25", description: "Massage, scrub, and paraffin hand therapy combined into one indulgent spa treatment.", duration: "30 min", serviceType: "Hand Spa" },
  { name: "Soak Off", slug: "soak-off", imageSrc: "/Soak%20Off.png", price: "$15", description: "Gentle product removal that protects the natural nail surface.", duration: "30 min", serviceType: "Nail Removal" },
  { name: "Broken Tip Repair", slug: "broken-tip-repair", imageSrc: "/Broken%20Tip%20Repair.png", price: "$1.50", description: "Repair a damaged or broken nail tip with careful shaping and finish.", duration: "10 min", serviceType: "Nail Repair" },
];

export const pedicureServices: ServiceMenuItem[] = [
  { name: "Luxury Spa for Legs", slug: "luxury-spa-for-legs", imageSrc: "/services/pedicure/luxury-pedicure-massage-scrub.png", price: "$25", description: "Massage, scrub, and paraffin therapy combined into one indulgent spa treatment for legs.", duration: "30 min", serviceType: "Foot Spa" },
  { name: "Luxury Pedicure + Massage & Scrub", slug: "luxury-pedicure-massage-scrub", imageSrc: "/services/pedicure/luxury-pedicure-massage-scrub.png", price: "$40", description: "Luxury pedicure care with a relaxing massage and smoothing foot scrub.", duration: "2 hr", serviceType: "Foot Spa" },
  { name: "Paraffin Therapy", slug: "paraffin-therapy", imageSrc: "/services/pedicure/paraffin-therapy.png", price: "$15", description: "Warm paraffin therapy to soften, hydrate, and comfort dry feet.", duration: "15 min", serviceType: "Foot Therapy" },
  { name: "Pedicure + Classic French", slug: "pedicure-classic-french", imageSrc: "/services/pedicure/pedicure-classic-french.png", price: "$17", description: "Pedicure care finished with classic French styling.", duration: "1 hr 30 min", serviceType: pedicureType },
  { name: "Pedicure + French Gelish", slug: "pedicure-french-gelish", imageSrc: "/services/pedicure/pedicure-french-gelish.png", price: "$20", description: "French pedicure styling with the durability of Gelish polish.", duration: "2 hr", serviceType: pedicureType },
  { name: "Pedicure + Gel Color", slug: "pedicure-gel-color", imageSrc: "/services/pedicure/pedicure-gel-color.png", price: "$17", description: "Relaxed pedicure care finished with long-lasting gel color.", duration: "2 hr", serviceType: pedicureType },
  { name: "Pedicure + Pose", slug: "pedicure-pose", imageSrc: "/services/pedicure/pedicure-pose.png", price: "$15", description: "Classic pedicure care finished with a neat pose application.", duration: "1 hr 30 min", serviceType: pedicureType },
  { name: "Pedicure + Ombré", slug: "pedicure-ombre", imageSrc: "/services/pedicure/pedicure-ombre.png", price: "$20", description: "Pedicure care finished with a soft, blended ombré nail color.", duration: "1 hr 45 min", serviceType: pedicureType },
];

const slugAliases: Record<string, string> = {
  "russian-manicure": "classic-manicure",
  "full-set-builder-gel": "full-set-poly-gel",
  "remove-rubber-cover-up": "rubber-cover-up",
  "soak-off-classic-manicure-oil": "soak-off",
  "soak-off-manicure": "soak-off",
  "massage-scrub-for-hands": "luxury-spa-for-hands",
  "massage-scrub-paraffin-hands": "luxury-spa-for-hands",
  "massage-scrub": "luxury-spa-for-hands",
  "ultimate-hand-spa": "luxury-spa-for-hands",
  "luxary-spa-for-hands": "luxury-spa-for-hands",
  "paraffin-hand-therapy": "luxury-spa-for-hands",
  "fungal-nail-care-and-treatment": "fungal",
  "fungal-nail-care-treatment": "fungal",
  "refill-poly-gel": "refill",
  "refill-hard-gel": "refill",
  "pedicure-classic-french-manicure": "pedicure-classic-french",
  "pedicure-french": "pedicure-classic-french",
  "pedicure-gel-color-gelish": "pedicure-gel-color",
  "pedicure-gelish": "pedicure-gel-color",
  "pedicure-massage-scrub-paraffin": "luxury-pedicure-massage-scrub",
  "pedicure-paraffin-hand-therapy": "paraffin-therapy",
};

const pedicureSlugAliases: Record<string, string> = {
  "massage-scrub": "luxury-pedicure-massage-scrub",
};

const manicureCanonicalServices = new Map(manicureServices.map((service) => [service.slug, service]));
const pedicureCanonicalServices = new Map(pedicureServices.map((service) => [service.slug, service]));

export function getCanonicalServiceSlug(slug: string) {
  return slugAliases[slug] ?? slug;
}

function getCanonicalServiceSlugForGroup(groupId: ServiceGroupId, slug: string) {
  if (groupId === "pedicure" && pedicureSlugAliases[slug]) {
    return pedicureSlugAliases[slug];
  }

  return getCanonicalServiceSlug(slug);
}

function getCanonicalService(groupId: ServiceGroupId, slug: string) {
  const canonicalSlug = getCanonicalServiceSlugForGroup(groupId, slug);
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
    duration: "5 min",
    durationMin: 5,
    description: "Custom nail detail.",
    serviceType: "Nail Art",
  },
  "gel-color": {
    name: "Gel Color",
    slug: "gel-color",
    imageSrc: "/services/manicure/gel-color.png",
    price: "$5",
    priceValue: 5,
    duration: "30 min",
    durationMin: 30,
    description: "Long-lasting gel color finish.",
    serviceType: addOnType,
  },
  "luxury-spa-for-hands": {
    name: "Luxury Spa for Hands",
    slug: "luxury-spa-for-hands",
    imageSrc: "/services/manicure/massage-scrub.png",
    price: "$25",
    priceValue: 25,
    duration: "30 min",
    durationMin: 30,
    description: "Massage, scrub, and paraffin hand therapy in one indulgent treatment.",
    serviceType: "Hand Spa",
  },
  "russian-manicure": {
    name: "Russian Manicure",
    slug: "russian-manicure",
    imageSrc: "/Russian%20Manicure.png",
    price: "$5",
    priceValue: 5,
    duration: "10 min",
    durationMin: 10,
    description: "Detailed cuticle preparation for a clean, polished finish.",
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
    name: "Nail Design",
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

const supportedManicureAddOns = [
  "chrome",
  "french",
  "ombre",
  "luxury-spa-for-hands",
  "nail-design",
  "russian-manicure",
];
const enhancementAddOns = [...supportedManicureAddOns, "broken-tip-repair"];

const manicureAddOnsByService: Record<string, string[]> = {
  "broken-tip-repair": supportedManicureAddOns,
  "full-set-poly-gel": supportedManicureAddOns,
  "full-set-hard-gel": supportedManicureAddOns,
  "full-set-gel-extension": supportedManicureAddOns,
  "full-set-fiber": supportedManicureAddOns,
  fungal: ["russian-manicure"],
  "hard-gel-color": enhancementAddOns,
  "luxury-spa-for-hands": ["russian-manicure"],
  pose: ["russian-manicure", "pose-design", "pose-french"],
  refill: enhancementAddOns,
  rubber: enhancementAddOns,
  "rubber-cover-up": enhancementAddOns,
  "rubber-gel-color": enhancementAddOns,
  "classic-manicure": [...supportedManicureAddOns.filter((slug) => slug !== "russian-manicure"), "broken-tip-repair"],
  "soak-off": ["russian-manicure"],
};

export function getServiceAddOns(groupId: ServiceGroupId, serviceSlug: string): ServiceAddOnOption[] {
  const slug = getCanonicalServiceSlugForGroup(groupId, serviceSlug);
  if (groupId === "pedicure") return [];

  return (manicureAddOnsByService[slug] ?? [])
    .map((addOnSlug) => {
      const existingAddOn = addOnOptions[addOnSlug];
      if (!existingAddOn) return null;
      if (slug === "pose" && addOnSlug === "russian-manicure") {
        return { ...existingAddOn, name: "Classic Manicure" };
      }
      return existingAddOn;
    })
    .filter((addOn): addOn is ServiceAddOnOption => Boolean(addOn));
}

export function getServiceInclusions(serviceSlug: string) {
  void serviceSlug;
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
  const canonicalSlug = getCanonicalServiceSlugForGroup(groupId, serviceSlug);
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
  const isPedicure = categoryName.toLowerCase().includes("pedicure");
  const canonicalSlug = getCanonicalServiceSlugForGroup(isPedicure ? "pedicure" : "manicure", slug);
  const knownService = [...manicureServices, ...pedicureServices].find((service) => service.slug === canonicalSlug);

  if (knownService) return knownService.imageSrc;

  const pedicureImageAliases: Record<string, string> = {
    "paraffin-therapy": "/services/pedicure/paraffin-therapy.png",
    "pedicure-gel-color": "/services/pedicure/pedicure-gel-color.png",
  };

  if (isPedicure && pedicureImageAliases[slug]) {
    return pedicureImageAliases[slug];
  }

  const folder = isPedicure ? "/pedicure/" : "/";
  return `${folder}${encodeURIComponent(name)}.png`;
}

export function getOptimizedServiceImage(imageSrc: string) {
  const [path, query = ""] = imageSrc.split("?");
  if (decodeURIComponent(path) === "/Nail Design.png") {
    return imageSrc;
  }

  const optimizedPath = `/optimized${path.replace(/\.(png|jpg|jpeg)$/i, ".webp")}`;
  return query ? `${optimizedPath}?${query}` : optimizedPath;
}

export function getServiceBySlugFromList(services: ServiceMenuItem[], serviceSlug: string | undefined) {
  const canonicalSlug = serviceSlug ? getCanonicalServiceSlug(serviceSlug) : undefined;
  return services.find((service) => service.slug === canonicalSlug || getCanonicalServiceSlug(service.slug) === canonicalSlug) ?? null;
}

export function getServiceBySlug(groupId: string | undefined, serviceSlug: string | undefined) {
  if (groupId !== "manicure" && groupId !== "pedicure") return null;
  const canonicalSlug = serviceSlug ? getCanonicalServiceSlugForGroup(groupId, serviceSlug) : undefined;
  return serviceGroups[groupId].find((service) => service.slug === canonicalSlug) ?? null;
}
