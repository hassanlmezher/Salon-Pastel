import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { CancelScreen } from "../features/booking/screens/CancelScreen";
import { LandingPage } from "../features/booking/screens/LandingPage";
import { ManageBookingScreen } from "../features/booking/screens/ManageBookingScreen";
import { NotFoundScreen } from "../features/booking/screens/NotFoundScreen";
import { RescheduleScreen } from "../features/booking/screens/RescheduleScreen";
import { ReviewStepScreen } from "../features/booking/screens/ReviewStepScreen";
import { ScheduleStepScreen } from "../features/booking/screens/ScheduleStepScreen";
import { ServiceStepScreen } from "../features/booking/screens/ServiceStepScreen";
import { SuccessScreen } from "../features/booking/screens/SuccessScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "book/service", element: <ServiceStepScreen /> },
      { path: "book/schedule", element: <ScheduleStepScreen /> },
      { path: "book/review", element: <ReviewStepScreen /> },
      { path: "book/success/:code", element: <SuccessScreen /> },
      { path: "manage/:code", element: <ManageBookingScreen /> },
      { path: "manage/:code/reschedule", element: <RescheduleScreen /> },
      { path: "manage/:code/cancel", element: <CancelScreen /> },
      { path: "*", element: <NotFoundScreen /> },
    ],
  },
]);
