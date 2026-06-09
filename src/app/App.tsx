import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { BookingProvider } from "../features/booking/context/BookingContext";

export default function App() {
  return (
    <BookingProvider>
      <RouterProvider router={router} />
    </BookingProvider>
  );
}
