import { Suspense } from "react";
import { AdminHome } from "./components/AdminHome";
import Loading from "./loading";

/** Static page: the list loads in the browser straight from Supabase, so no server work runs per visit. */
export default function AdminHomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminHome />
    </Suspense>
  );
}
