import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { BookingChoiceScreen } from "../features/booking/screens/BookingChoiceScreen";
import { EmptyBookingScreen } from "../features/booking/screens/EmptyBookingScreen";
import { LandingPage } from "../features/booking/screens/LandingPage";
import { ServiceDetailScreen } from "../features/booking/screens/ServiceDetailScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "book", element: <BookingChoiceScreen /> },
      { path: "book/manicure", element: <EmptyBookingScreen /> },
      { path: "book/pedicure", element: <EmptyBookingScreen /> },
      { path: "book/:groupId/:serviceSlug", element: <ServiceDetailScreen /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
