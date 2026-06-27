"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

export function LoginPasswordField() {
  const [visible, setVisible] = useState(false);

  return (
    <label className="loginInputShell">
      <span className="loginInputIcon" aria-hidden="true">
        <LockKeyhole size={28} strokeWidth={1.7} />
      </span>
      <input
        name="password"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Password"
        required
      />
      <button
        type="button"
        className="loginPasswordToggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <Eye size={28} strokeWidth={1.7} /> : <EyeOff size={28} strokeWidth={1.7} />}
      </button>
    </label>
  );
}
