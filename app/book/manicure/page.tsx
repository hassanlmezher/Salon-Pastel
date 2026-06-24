import { manicureServices } from "../../../src/features/booking/data/serviceMenu";
import { ServiceMenu } from "../ServiceMenu";

export default function ManicurePage() {
  return <ServiceMenu title="Manicure Services" services={manicureServices} />;
}
