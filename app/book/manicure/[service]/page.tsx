import { ServiceDetail } from "../../ServiceDetail";
import { fetchServiceBySlug } from "../../../../src/features/booking/data/supabaseBooking";
import { getServiceBySlug, manicureServices } from "../../../../src/features/booking/data/serviceMenu";

type PageProps = {
  params: Promise<{ service: string }>;
};

export const revalidate = 3600;

export function generateStaticParams() {
  return manicureServices.map((service) => ({ service: service.slug }));
}

export default async function ManicureServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params;
  const initialService =
    (await fetchServiceBySlug("manicure", serviceSlug).catch(() => null)) ??
    getServiceBySlug("manicure", serviceSlug);

  return <ServiceDetail groupId="manicure" serviceSlug={serviceSlug} initialService={initialService} />;
}
