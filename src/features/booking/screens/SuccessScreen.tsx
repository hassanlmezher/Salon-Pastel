import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ConfirmationPanel } from "../components/ConfirmationPanel";
import { EmptyState } from "../components/EmptyState";
import { SkeletonState } from "../components/SkeletonState";
import { bookingApi } from "../mocks/api";
import type { Booking } from "../types";

export function SuccessScreen() {
  const { code } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    bookingApi.getBooking(code).then((response) => {
      setBooking(response);
      setLoading(false);
    });
  }, [code]);

  if (loading) return <SkeletonState lines={5} />;
  if (!booking) {
    return <EmptyState title="Booking not found" description="We could not find that confirmation code." />;
  }

  return <ConfirmationPanel booking={booking} />;
}
