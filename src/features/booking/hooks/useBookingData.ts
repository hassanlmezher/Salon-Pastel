import { useEffect, useState } from "react";
import { bookingApi } from "../mocks/api";
import type { BookingConfig, ServiceOption } from "../types";

export function useBookingData() {
  const [config, setConfig] = useState<BookingConfig | null>(null);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([bookingApi.getConfig(), bookingApi.getServices()]).then(
      ([configResponse, servicesResponse]) => {
        if (!active) return;
        setConfig(configResponse);
        setServiceOptions(servicesResponse);
        setLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, []);

  return { config, serviceOptions, loading };
}
