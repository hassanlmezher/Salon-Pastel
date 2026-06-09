import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../components/EmptyState";

export function NotFoundScreen() {
  return (
    <EmptyState
      title="Page not found"
      description="The route exists in the product map, but the address you entered does not."
      action={
        <Link to="/book/service">
          <Button type="button">Return to booking</Button>
        </Link>
      }
    />
  );
}
