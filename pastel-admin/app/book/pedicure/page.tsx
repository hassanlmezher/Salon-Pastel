import { ServiceMenu } from "../ServiceMenu";

export const revalidate = 3600;

export default function PedicurePage() {
  return <ServiceMenu groupId="pedicure" title="Pedicure Services" />;
}
