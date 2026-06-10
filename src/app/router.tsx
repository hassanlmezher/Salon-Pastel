import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { BookAppointmentScreen } from "../features/booking/screens/BookAppointmentScreen";
import { LandingPage } from "../features/booking/screens/LandingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "book", element: <BookAppointmentScreen /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
