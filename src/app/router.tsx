import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";

const LandingPage = lazy(() =>
  import("../features/booking/screens/LandingPage").then((module) => ({ default: module.LandingPage })),
);
const BookingChoiceScreen = lazy(() =>
  import("../features/booking/screens/BookingChoiceScreen").then((module) => ({ default: module.BookingChoiceScreen })),
);
const EmptyBookingScreen = lazy(() =>
  import("../features/booking/screens/EmptyBookingScreen").then((module) => ({ default: module.EmptyBookingScreen })),
);
const ServiceDetailScreen = lazy(() =>
  import("../features/booking/screens/ServiceDetailScreen").then((module) => ({ default: module.ServiceDetailScreen })),
);

function Page({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-[#fbf7f3] px-4 text-center text-[#705e58]">
          <div>
            <p className="font-display text-4xl font-semibold text-[#7d463d]">Pastel</p>
            <p className="mt-2 text-sm">Preparing your experience…</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Page><LandingPage /></Page> },
      { path: "book", element: <Page><BookingChoiceScreen /></Page> },
      { path: "book/manicure", element: <Page><EmptyBookingScreen /></Page> },
      { path: "book/pedicure", element: <Page><EmptyBookingScreen /></Page> },
      { path: "book/:groupId/:serviceSlug", element: <Page><ServiceDetailScreen /></Page> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
