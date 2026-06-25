import { ServiceMenu } from "../ServiceMenu";

export const revalidate = 3600;

export default function ManicurePage() {
  return <ServiceMenu groupId="manicure" title="Manicure Services" />;
}
