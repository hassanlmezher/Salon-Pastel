import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { LandingPage } from "../features/booking/screens/LandingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
