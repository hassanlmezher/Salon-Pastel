"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "../../src/lib/api";
import { getOpeningHours, saveOpeningHours, type OpeningDay } from "../actions";
import Loading from "../loading";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// The salon week reads Monday to Sunday.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DEFAULT_OPENS = "08:00";
const DEFAULT_CLOSES = "15:00";

export function OpeningHoursEditor() {
  const router = useRouter();
  const [hours, setHours] = useState<OpeningDay[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "done"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    getOpeningHours()
      .then((list) => {
        if (!cancelled) setHours(list);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }
        console.error("Unable to load opening hours", error);
        setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadCount, router]);

  function updateDay(day: number, changes: Partial<OpeningDay>) {
    setMessage(null);
    setHours((current) =>
      current?.map((item) => {
        if (item.day !== day) return item;
        const next = { ...item, ...changes };
        if (next.open) {
          next.opensAt ||= DEFAULT_OPENS;
          next.closesAt ||= DEFAULT_CLOSES;
        }
        return next;
      }) ?? null,
    );
  }

  async function handleSave() {
    if (!hours) return;
    const wrongDay = hours.find((item) => item.open && (!item.opensAt || !item.closesAt || item.closesAt <= item.opensAt));
    if (wrongDay) {
      setMessage({ kind: "error", text: `${DAY_NAMES[wrongDay.day]}: the closing time must be after the opening time.` });
      return;
    }

    setSaving(true);
    setMessage(null);
    const result = await saveOpeningHours(hours);
    setSaving(false);
    if (result.message === "signed_out") {
      router.replace("/login");
      return;
    }
    setMessage(
      result.ok
        ? { kind: "done", text: "Saved. New bookings use these hours now." }
        : { kind: "error", text: result.message },
    );
  }

  if (!hours && !loadError) return <Loading />;

  return (
    <main className="adminPage">
      <header className="adminTopbar">
        <Link href="/" className="adminLogout">
          <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
          Appointments
        </Link>
      </header>

      <h1 className="adminHoursTitle">Opening hours</h1>
      <p className="adminHoursIntro">
        Customers can only book inside these hours. Appointments already booked stay as they are.
      </p>

      {loadError || !hours ? (
        <section className="adminEmpty" role="alert">
          <h2>Could not load the opening hours</h2>
          <p>Check the connection and try again.</p>
          <button type="button" className="loginSubmit adminRetry" onClick={() => setReloadCount((count) => count + 1)}>
            Try again
          </button>
        </section>
      ) : (
        <>
          <ul className="adminHoursList">
            {WEEK_ORDER.map((day) => {
              const item = hours.find((entry) => entry.day === day) ?? { day, open: false, opensAt: null, closesAt: null };
              const name = DAY_NAMES[day];
              return (
                <li key={day} className="adminHoursRow" data-open={item.open}>
                  <label className="adminHoursDay">
                    <input
                      type="checkbox"
                      checked={item.open}
                      onChange={(event) => updateDay(day, { open: event.target.checked })}
                    />
                    <span>{name}</span>
                  </label>
                  {item.open ? (
                    <div className="adminHoursTimes">
                      <label>
                        <span className="srOnly">{name} opens at</span>
                        <input
                          type="time"
                          step={900}
                          value={item.opensAt ?? ""}
                          onChange={(event) => updateDay(day, { opensAt: event.target.value })}
                        />
                      </label>
                      <span aria-hidden="true">to</span>
                      <label>
                        <span className="srOnly">{name} closes at</span>
                        <input
                          type="time"
                          step={900}
                          value={item.closesAt ?? ""}
                          onChange={(event) => updateDay(day, { closesAt: event.target.value })}
                        />
                      </label>
                    </div>
                  ) : (
                    <span className="adminHoursClosed">Closed</span>
                  )}
                </li>
              );
            })}
          </ul>

          {message ? (
            <p className={message.kind === "error" ? "adminRescheduleError" : "adminHoursSaved"} role={message.kind === "error" ? "alert" : "status"}>
              {message.text}
            </p>
          ) : null}

          <button type="button" className="adminNewButton adminHoursSave" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save opening hours"}
          </button>
        </>
      )}
    </main>
  );
}
