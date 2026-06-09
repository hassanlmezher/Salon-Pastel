import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Dialog } from "../../../components/ui/Dialog";
import { SkeletonState } from "../components/SkeletonState";
import { bookingApi } from "../mocks/api";
import type { Booking } from "../types";

export function CancelScreen() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!code) return;
    bookingApi.getBooking(code).then(setBooking);
  }, [code]);

  if (!booking) return <SkeletonState lines={5} />;

  return (
    <>
      <Card className="max-w-3xl p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-error">Cancellation</p>
        <h1 className="mt-3 font-display text-[42px] leading-none text-text">Cancel this appointment?</h1>
        <p className="mt-4 text-base leading-8 text-text-secondary">
          This action is immediate in the mock booking store. In a live system, this would also handle refunds or deposit adjustments where relevant.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => setOpen(true)}>
            Confirm cancellation
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/manage/${booking.code}`)}>
            Keep booking
          </Button>
        </div>
      </Card>

      <Dialog
        open={open}
        title="Cancel booking"
        description="This will mark the appointment as cancelled in the current session."
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={async () => {
              await bookingApi.cancelBooking(booking.code);
              navigate(`/manage/${booking.code}`);
            }}
          >
            Yes, cancel it
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Go back
          </Button>
        </div>
      </Dialog>
    </>
  );
}
