import { ServiceDetail } from "../../ServiceDetail";

type PageProps = {
  params: Promise<{ service: string }>;
};

export default async function PedicureServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params;

  return <ServiceDetail groupId="pedicure" serviceSlug={serviceSlug} />;
}
