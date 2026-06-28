import {
  AdminBottomNav,
  AdminFilterPanel,
  AdminTopBar,
  AppointmentCardList,
  OverviewCards,
} from "./components/AdminMobileShell";
import { getAdminAppointments, parseAdminFilters } from "../src/features/admin/data/adminAppointments";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const filters = parseAdminFilters(params);
  const allAppointments = await getAdminAppointments({});
  const visibleAppointments = await getAdminAppointments(filters);

  return (
    <main className="mobileAdminShell">
      <AdminTopBar />
      <OverviewCards appointments={allAppointments} />
      <AdminFilterPanel filters={filters} action="/" />
      <AppointmentCardList appointments={visibleAppointments.slice(0, 3)} />
      <AdminBottomNav active="dashboard" />
    </main>
  );
}
