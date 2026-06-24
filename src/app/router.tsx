import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { BookingChoiceScreen } from "../features/booking/screens/BookingChoiceScreen";
import { EmptyBookingScreen } from "../features/booking/screens/EmptyBookingScreen";
import { LandingPage } from "../features/booking/screens/LandingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "book", element: <BookingChoiceScreen /> },
      { path: "book/manicure", element: <EmptyBookingScreen /> },
      { path: "book/pedicure", element: <EmptyBookingScreen /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
