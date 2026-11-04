"use client";

import { useEffect } from "react";

/** Old link kept working: everything now lives on the home screen. */
export default function DashboardAliasPage() {
  useEffect(() => {
    window.location.replace("/");
  }, []);

  return null;
}
