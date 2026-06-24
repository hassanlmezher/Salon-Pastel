import { pedicureServices } from "../../../src/features/booking/data/serviceMenu";
import { ServiceMenu } from "../ServiceMenu";

export default function PedicurePage() {
  return <ServiceMenu groupId="pedicure" title="Pedicure Services" services={pedicureServices} />;
}
