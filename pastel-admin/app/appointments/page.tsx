import {
  AdminBottomNav,
  AdminFilterPanel,
  AdminTopBar,
  AppointmentCardList,
  AppointmentsPageHeader,
  AppointmentStatusTabs,
} from "../components/AdminMobileShell";
import { getAdminAppointments, parseAdminFilters } from "../../src/features/admin/data/adminAppointments";

export const dynamic = "force-dynamic";

type AppointmentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const params = (await searchParams) ?? {};
  const filters = parseAdminFilters(params);
  const tabBaseAppointments = await getAdminAppointments({
    date: filters.date,
    search: filters.search,
    sort: filters.sort,
  });
  const appointments = await getAdminAppointments(filters);

  return (
    <main className="mobileAdminShell">
      <AdminTopBar />
      <AppointmentsPageHeader />
      <AdminFilterPanel filters={filters} action="/appointments" includeSort />
      <AppointmentStatusTabs appointments={tabBaseAppointments} filters={filters} />
      <AppointmentCardList appointments={appointments} showDetailsButton />
      <AdminBottomNav active="appointments" />
    </main>
  );
}
