import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ManageBookingView } from "../components/ManageBookingView";
import { SkeletonState } from "../components/SkeletonState";
import { bookingApi } from "../mocks/api";
import type { Booking } from "../types";

export function ManageBookingScreen() {
  const { code } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!code) return;
    bookingApi.getBooking(code).then(setBooking);
  }, [code]);

  if (!booking) return <SkeletonState lines={6} />;
  return <ManageBookingView booking={booking} />;
}
