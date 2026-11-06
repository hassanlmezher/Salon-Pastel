import { Suspense } from "react";
import { AdminHome } from "./components/AdminHome";
import Loading from "./loading";

/** Static page: the list loads in the browser from the admin's /api routes, so no server work runs to show the page. */
export default function AdminHomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminHome />
    </Suspense>
  );
}
