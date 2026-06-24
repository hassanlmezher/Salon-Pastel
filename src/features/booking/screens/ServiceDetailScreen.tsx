import { Navigate, useParams } from "react-router-dom";
import { ServiceDetailPage } from "../components/ServiceDetailPage";
import { getServiceBySlug } from "../data/serviceMenu";

export function ServiceDetailScreen() {
  const { groupId, serviceSlug } = useParams();
  const service = getServiceBySlug(groupId, serviceSlug);

  if (!service || (groupId !== "manicure" && groupId !== "pedicure")) {
    return <Navigate to="/book" replace />;
  }

  return <ServiceDetailPage groupId={groupId} service={service} />;
}
