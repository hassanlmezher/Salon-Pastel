import { CalendarDays } from "lucide-react";
import { logoutOwner } from "./actions";
import { AppointmentTable } from "./components/AppointmentTable";
import { Filters } from "./components/Filters";
import { SummaryCards } from "./components/SummaryCards";
import { getAdminAppointments, parseAdminFilters, requireOwnerUser } from "../src/features/admin/data/adminAppointments";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  await requireOwnerUser();
  const params = (await searchParams) ?? {};
  const filters = parseAdminFilters(params);
  const appointments = await getAdminAppointments(filters);

  return (
    <main className="adminShell">
      <header className="adminHeader">
        <div>
          <p className="eyebrow">Pastel owner dashboard</p>
          <h1>Appointments</h1>
          <p>Review bookings, filter the schedule, and update appointment status.</p>
        </div>
        <form action={logoutOwner}>
          <button type="submit" className="logoutButton">
            Log out
          </button>
        </form>
      </header>

      <section className="toolbar" aria-label="Appointment controls">
        <div className="toolbarTitle">
          <CalendarDays size={20} strokeWidth={1.8} />
          <span>Schedule manager</span>
        </div>
        <Filters filters={filters} />
      </section>

      <SummaryCards appointments={appointments} />
      <AppointmentTable appointments={appointments} />
    </main>
  );
}
