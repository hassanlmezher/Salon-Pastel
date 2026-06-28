import Link from "next/link";
import {
  ArrowDownUp,
  CalendarDays,
  CalendarRange,
  Clock3,
  Grid2X2,
  ListFilter,
  LogOut,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Tag,
  XCircle,
} from "lucide-react";
import { logoutOwner } from "../actions";
import { FilterAutoSubmit } from "./FilterAutoSubmit";
import { StatusSelect } from "./StatusSelect";
import type { AdminAppointment, AdminAppointmentFilters, AppointmentStatus } from "../../src/features/admin/types";

type AdminPage = "dashboard" | "appointments";

const statusLabels: Record<AppointmentStatus, string> = {
  booked: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const statusTabs = [
  { label: "All", value: "" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "booked" },
  { label: "Cancelled", value: "cancelled" },
] as const;

function toDateInputValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatFilterDate(value?: string) {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return "Select date";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value: number) {
  return `$${Number.isInteger(value) ? value.toLocaleString("en-US") : value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toDateInputValue(date);
}

function isSameMonth(value: string, date: Date) {
  const appointmentDate = new Date(value);
  return (
    !Number.isNaN(appointmentDate.getTime()) &&
    appointmentDate.getFullYear() === date.getFullYear() &&
    appointmentDate.getMonth() === date.getMonth()
  );
}

function isUpcoming(appointment: AdminAppointment, now: Date) {
  const date = new Date(appointment.appointmentStart);
  return !Number.isNaN(date.getTime()) && date >= now && !["cancelled", "no_show"].includes(appointment.status);
}

function getPrimaryService(appointment: AdminAppointment) {
  return appointment.selectedServices[0]?.name || "Not set";
}

function getAddOns(appointment: AdminAppointment) {
  return appointment.selectedServices
    .slice(1)
    .map((service) => service.name)
    .filter(Boolean)
    .join(", ");
}

function getStatusCount(appointments: AdminAppointment[], status: string) {
  if (!status) return appointments.length;
  if (status === "cancelled") {
    return appointments.filter((appointment) => appointment.status === "cancelled" || appointment.status === "no_show").length;
  }

  return appointments.filter((appointment) => appointment.status === status).length;
}

export function AdminTopBar() {
  return (
    <header className="mobileAdminTopbar">
      <div className="mobileBrand" aria-label="Pastel Admin Owner Dashboard">
        <div className="mobileBrandName">Pastel</div>
        <div className="mobileBrandAdmin">
          <span />
          Admin
          <span />
        </div>
        <p>Owner Dashboard</p>
      </div>

      <form action={logoutOwner} className="mobileLogoutForm">
        <button type="submit" className="mobileLogoutButton" aria-label="Logout">
          <span>
            <LogOut size={30} strokeWidth={1.8} />
          </span>
          Logout
        </button>
      </form>
    </header>
  );
}

export function AdminBottomNav({ active }: { active: AdminPage }) {
  return (
    <nav className="mobileBottomNav" aria-label="Admin navigation">
      <Link href="/" className={active === "dashboard" ? "active" : ""}>
        <Grid2X2 size={31} strokeWidth={active === "dashboard" ? 2.4 : 1.8} />
        <span>Dashboard</span>
      </Link>
      <Link href="/appointments" className={active === "appointments" ? "active" : ""}>
        <CalendarDays size={31} strokeWidth={active === "appointments" ? 2.4 : 1.8} />
        <span>Appointments</span>
      </Link>
    </nav>
  );
}

export function OverviewCards({ appointments }: { appointments: AdminAppointment[] }) {
  const now = new Date();
  const todayKey = toDateInputValue(now);
  const todayAppointments = appointments.filter((appointment) => getDateKey(appointment.appointmentStart) === todayKey);
  const upcomingAppointments = appointments.filter((appointment) => isUpcoming(appointment, now));
  const monthlyRevenue = appointments
    .filter((appointment) => isSameMonth(appointment.appointmentStart, now))
    .filter((appointment) => appointment.status !== "cancelled" && appointment.status !== "no_show")
    .reduce((total, appointment) => total + appointment.totalPrice, 0);
  const cancelledAppointments = appointments.filter((appointment) => appointment.status === "cancelled" || appointment.status === "no_show");

  const cards = [
    { title: "Today", value: todayAppointments.length.toString(), note: "Appointments", icon: CalendarDays },
    { title: "Upcoming", value: upcomingAppointments.length.toString(), note: "Appointments", icon: Clock3 },
    { title: "Revenue", value: formatMoney(monthlyRevenue), note: "This Month", icon: Tag },
    { title: "Cancelled", value: cancelledAppointments.length.toString(), note: "Appointments", icon: XCircle },
  ];

  return (
    <section className="mobileOverview" aria-label="Overview">
      <h1>Overview</h1>
      <div className="mobileOverviewGrid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="mobileMetricCard" key={card.title}>
              <div className="mobileMetricIcon">
                <Icon size={39} strokeWidth={1.85} />
              </div>
              <div>
                <p>{card.title}</p>
                <strong>{card.value}</strong>
                <span>{card.note}</span>
              </div>
              <svg className="mobileSparkline" viewBox="0 0 160 55" aria-hidden="true">
                <path d="M1 47 C21 32 36 48 55 45 C76 42 72 25 95 24 C119 22 111 -2 130 5 C147 11 139 47 159 31" />
              </svg>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function AdminFilterPanel({
  filters,
  action,
  includeSort = false,
}: {
  filters: AdminAppointmentFilters;
  action: string;
  includeSort?: boolean;
}) {
  const dateValue = filters.date || toDateInputValue(new Date());
  const formId = includeSort ? "appointments-filters" : "dashboard-filters";

  return (
    <form id={formId} className="mobileFilterPanel" action={action}>
      <label className="mobileSearchField">
        <Search size={28} strokeWidth={1.75} aria-hidden="true" />
        <input name="search" type="search" placeholder="Search name or phone..." defaultValue={filters.search ?? ""} />
      </label>

      <div className={includeSort ? "mobileFilterGrid three" : "mobileFilterGrid"}>
        <label className="mobileSelectField">
          <CalendarDays size={25} strokeWidth={1.75} aria-hidden="true" />
          <span>{formatFilterDate(dateValue)}</span>
          <input name="date" type="date" defaultValue={dateValue} aria-label="Appointment date" />
        </label>

        <label className="mobileSelectField">
          <ListFilter size={25} strokeWidth={1.75} aria-hidden="true" />
          <span>{filters.status ? statusLabels[filters.status] : "All Status"}</span>
          <select name="status" defaultValue={filters.status ?? ""} aria-label="Appointment status">
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="booked">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No-show</option>
          </select>
        </label>

        {includeSort ? (
          <label className="mobileSelectField">
            <ArrowDownUp size={25} strokeWidth={1.75} aria-hidden="true" />
            <span>{filters.sort === "oldest" ? "Oldest" : "Newest"}</span>
            <select name="sort" defaultValue={filters.sort ?? "newest"} aria-label="Sort appointments">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        ) : null}
      </div>

      <button type="submit" className="mobileFilterSubmit">Apply filters</button>
      <FilterAutoSubmit formId={formId} />
    </form>
  );
}

export function AppointmentStatusTabs({
  appointments,
  filters,
}: {
  appointments: AdminAppointment[];
  filters: AdminAppointmentFilters;
}) {
  const sharedParams = new URLSearchParams();
  if (filters.date) sharedParams.set("date", filters.date);
  if (filters.search) sharedParams.set("search", filters.search);
  if (filters.sort) sharedParams.set("sort", filters.sort);

  return (
    <nav className="mobileStatusTabs" aria-label="Appointment status">
      {statusTabs.map((tab) => {
        const params = new URLSearchParams(sharedParams);
        if (tab.value) params.set("status", tab.value);
        const href = `/appointments${params.toString() ? `?${params.toString()}` : ""}`;
        const active = (filters.status ?? "") === tab.value;

        return (
          <Link href={href} key={tab.label} className={active ? "active" : ""}>
            <span>{tab.label}</span>
            <strong>{getStatusCount(appointments, tab.value)}</strong>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppointmentCardList({
  appointments,
  showDetailsButton = false,
}: {
  appointments: AdminAppointment[];
  showDetailsButton?: boolean;
}) {
  if (appointments.length === 0) {
    return (
      <section className="mobileEmptyState">
        <h2>No appointments found</h2>
        <p>Try a different date, status, or search term.</p>
      </section>
    );
  }

  return (
    <section className="mobileAppointmentList" aria-label="Appointments">
      {appointments.map((appointment) => (
        <article className="mobileAppointmentCard" key={appointment.id}>
          <div className="mobileAvatar" aria-hidden="true">
            <span />
            <i />
          </div>

          <div className="mobileAppointmentMain">
            <h2>{appointment.customerFullName}</h2>
            <p className="mobilePhone">
              <Phone size={21} strokeWidth={1.8} />
              {appointment.customerPhone || "Not provided"}
            </p>

            <dl className="mobileServiceMeta">
              <div>
                <dt>Service:</dt>
                <dd>{getPrimaryService(appointment)}</dd>
              </div>
              <div>
                <dt>Add-ons:</dt>
                <dd>{getAddOns(appointment) || "None"}</dd>
              </div>
            </dl>

            {showDetailsButton ? (
              <Link href={`/appointments?appointment=${appointment.id}`} className="mobileDetailsButton">
                View Details
              </Link>
            ) : null}
          </div>

          <div className="mobileAppointmentActions">
            <StatusSelect appointmentId={appointment.id} status={appointment.status} />
            <button type="button" className="mobileMoreButton" aria-label={`More actions for ${appointment.customerFullName}`}>
              <MoreVertical size={30} strokeWidth={2.2} />
            </button>
          </div>

          <div className="mobileAppointmentFacts">
            <span>
              <CalendarDays size={24} strokeWidth={1.8} />
              {appointment.appointmentDate || "Not set"}
            </span>
            <span>
              <Clock3 size={24} strokeWidth={1.8} />
              {appointment.appointmentTime || "Not set"}
            </span>
            <span>
              <Tag size={24} strokeWidth={1.8} />
              {formatMoney(appointment.totalPrice)}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

export function AppointmentsPageHeader() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "http://127.0.0.1:5173/book";

  return (
    <section className="mobileAppointmentsHero">
      <div className="mobileAppointmentsTitle">
        <span>
          <CalendarRange size={32} strokeWidth={1.8} />
        </span>
        <div>
          <h1>Appointments</h1>
          <a href={bookingUrl} className="mobileNewAppointment">
            <Plus size={27} strokeWidth={1.9} />
            New Appointment
          </a>
        </div>
      </div>
    </section>
  );
}
