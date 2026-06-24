import { Navigate, useParams } from "react-router-dom";
import { ServiceDetailPage } from "../components/ServiceDetailPage";

export function ServiceDetailScreen() {
  const { groupId, serviceSlug } = useParams();

  if (!serviceSlug || (groupId !== "manicure" && groupId !== "pedicure")) {
    return <Navigate to="/book" replace />;
  }

  return <ServiceDetailPage groupId={groupId} serviceSlug={serviceSlug} />;
}
