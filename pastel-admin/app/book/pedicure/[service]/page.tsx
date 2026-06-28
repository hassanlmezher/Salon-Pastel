import { ServiceDetail } from "../../ServiceDetail";
import { fetchServiceBySlug } from "../../../../src/features/booking/data/supabaseBooking";
import { getServiceBySlug, pedicureServices } from "../../../../src/features/booking/data/serviceMenu";

type PageProps = {
  params: Promise<{ service: string }>;
};

export const revalidate = 3600;

export function generateStaticParams() {
  return pedicureServices.map((service) => ({ service: service.slug }));
}

export default async function PedicureServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params;
  const initialService =
    (await fetchServiceBySlug("pedicure", serviceSlug).catch(() => null)) ??
    getServiceBySlug("pedicure", serviceSlug);

  return <ServiceDetail groupId="pedicure" serviceSlug={serviceSlug} initialService={initialService} />;
}
