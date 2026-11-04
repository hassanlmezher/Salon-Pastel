"use client";

import { useEffect } from "react";

/** Old link kept working: everything now lives on the home screen. */
export default function AppointmentsAliasPage() {
  useEffect(() => {
    window.location.replace(`/${window.location.search}`);
  }, []);

  return null;
}
