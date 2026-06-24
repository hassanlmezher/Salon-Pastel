import { useLocation } from "react-router-dom";
import { ServiceMenuPage } from "../components/ServiceMenuPage";
import { manicureServices, pedicureServices } from "../data/serviceMenu";

export function EmptyBookingScreen() {
  const { pathname } = useLocation();

  if (pathname.endsWith("/pedicure")) {
    return <ServiceMenuPage groupId="pedicure" title="Pedicure Services" services={pedicureServices} />;
  }

  return <ServiceMenuPage groupId="manicure" title="Manicure Services" services={manicureServices} />;
}
