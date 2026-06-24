import { ServiceDetail } from "../../ServiceDetail";

type PageProps = {
  params: Promise<{ service: string }>;
};

export default async function ManicureServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params;

  return <ServiceDetail groupId="manicure" serviceSlug={serviceSlug} />;
}
