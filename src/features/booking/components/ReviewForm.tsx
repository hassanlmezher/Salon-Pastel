import { useMemo, useRef } from "react";
import { z } from "zod";
import { Button } from "../../../components/ui/Button";
import { Field, TextareaField } from "../../../components/ui/Field";
import type { BookingGuest } from "../types";
import { ErrorSummary } from "./ErrorSummary";

const schema = z.object({
  firstName: z.string().min(2, "Enter your first name."),
  lastName: z.string().min(2, "Enter your last name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(8, "Enter a valid phone number."),
  notes: z.string().optional(),
  consent: z.boolean().refine((value) => value, "Please confirm we can use these details for your booking."),
});

type FormProps = {
  guest: BookingGuest;
  onChange: (guest: BookingGuest) => void;
  onSubmit: () => void;
  submitting: boolean;
};

export function ReviewForm({ guest, onChange, onSubmit, submitting }: FormProps) {
  const submitted = useRef(false);
  const errors = useMemo(() => {
    if (!submitted.current) return [];
    const result = schema.safeParse(guest);
    if (result.success) return [];
    return result.error.issues.map((issue) => ({
      field: String(issue.path[0]),
      message: issue.message,
    }));
  }, [guest]);

  const errorMap = Object.fromEntries(errors.map((error) => [error.field, error.message]));

  const submit = () => {
    submitted.current = true;
    const result = schema.safeParse(guest);
    if (!result.success) return;
    onSubmit();
  };

  return (
    <div className="space-y-5">
      <ErrorSummary title="Please correct the following before continuing." errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          value={guest.firstName}
          onChange={(event) => onChange({ ...guest, firstName: event.target.value })}
          error={errorMap.firstName}
        />
        <Field
          id="lastName"
          label="Last name"
          value={guest.lastName}
          onChange={(event) => onChange({ ...guest, lastName: event.target.value })}
          error={errorMap.lastName}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={guest.email}
          onChange={(event) => onChange({ ...guest, email: event.target.value })}
          error={errorMap.email}
        />
        <Field
          id="phone"
          label="Phone"
          type="tel"
          value={guest.phone}
          onChange={(event) => onChange({ ...guest, phone: event.target.value })}
          error={errorMap.phone}
        />
      </div>
      <TextareaField
        id="notes"
        label="Booking notes (optional)"
        value={guest.notes}
        onChange={(event) => onChange({ ...guest, notes: event.target.value })}
      />
      <label className="flex items-start gap-3 rounded-[22px] border border-stroke bg-surface-muted px-4 py-4">
        <input
          id="consent"
          type="checkbox"
          checked={guest.consent}
          onChange={(event) => onChange({ ...guest, consent: event.target.checked })}
          className="mt-1 h-4 w-4 border-stroke text-gold-deep focus:ring-gold-rich"
        />
        <span className="text-sm leading-7 text-text-secondary">
          I agree that Salon Pastel may use these details to manage this booking and send appointment updates.
        </span>
      </label>
      {errorMap.consent ? <p className="text-sm text-error">{errorMap.consent}</p> : null}
      <Button type="button" onClick={submit} disabled={submitting} fullWidth>
        {submitting ? "Confirming..." : "Confirm appointment"}
      </Button>
    </div>
  );
}
