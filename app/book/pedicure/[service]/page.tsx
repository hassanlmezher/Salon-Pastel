import { notFound } from "next/navigation";
import { ServiceDetail } from "../../ServiceDetail";
import { getServiceBySlug } from "../../../../src/features/booking/data/serviceMenu";

type PageProps = {
  params: Promise<{ service: string }>;
};

export default async function PedicureServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params;
  const service = getServiceBySlug("pedicure", serviceSlug);

  if (!service) notFound();

  return <ServiceDetail groupId="pedicure" service={service} />;
}
