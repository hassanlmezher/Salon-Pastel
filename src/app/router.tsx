import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { ServiceMenuPage } from "../features/booking/components/ServiceMenuPage";
import { LandingPage } from "../features/booking/screens/LandingPage";
import { ServiceDetailScreen } from "../features/booking/screens/ServiceDetailScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "book", element: <ServiceMenuPage /> },
      // Older links to the separate manicure/pedicure pages.
      { path: "book/manicure", element: <Navigate to="/book" replace /> },
      { path: "book/pedicure", element: <Navigate to="/book?type=pedicure" replace /> },
      { path: "book/:groupId/:serviceSlug", element: <ServiceDetailScreen /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
