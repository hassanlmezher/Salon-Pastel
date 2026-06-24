import { useLocation } from "react-router-dom";
import { ServiceMenuPage } from "../components/ServiceMenuPage";
import { manicureServices, pedicureServices } from "../data/serviceMenu";

export function EmptyBookingScreen() {
  const { pathname } = useLocation();

  if (pathname.endsWith("/pedicure")) {
    return <ServiceMenuPage title="Pedicure Services" services={pedicureServices} />;
  }

  return <ServiceMenuPage title="Manicure Services" services={manicureServices} />;
}
