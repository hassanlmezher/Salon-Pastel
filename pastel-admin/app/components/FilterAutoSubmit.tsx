"use client";

import { useEffect } from "react";

export function FilterAutoSubmit({ formId }: { formId: string }) {
  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;

    let searchTimer = 0;

    const submitForm = () => {
      form.requestSubmit();
    };

    const handleInput = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;

      if (target.type !== "search") {
        submitForm();
        return;
      }

      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(submitForm, 450);
    };

    const handleChange = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === "search") return;
      submitForm();
    };

    form.addEventListener("input", handleInput);
    form.addEventListener("change", handleChange);

    return () => {
      window.clearTimeout(searchTimer);
      form.removeEventListener("input", handleInput);
      form.removeEventListener("change", handleChange);
    };
  }, [formId]);

  return null;
}
