import { useLocation } from "react-router-dom";
import { ServiceMenuPage } from "../components/ServiceMenuPage";

export function EmptyBookingScreen() {
  const { pathname } = useLocation();

  if (pathname.endsWith("/pedicure")) {
    return <ServiceMenuPage groupId="pedicure" title="Pedicure Services" />;
  }

  return <ServiceMenuPage groupId="manicure" title="Manicure Services" />;
}
