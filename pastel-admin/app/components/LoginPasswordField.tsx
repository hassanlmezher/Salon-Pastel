"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function LoginPasswordField() {
  const [visible, setVisible] = useState(false);

  return (
    <label className="loginField">
      <span>Password</span>
      <span className="loginPasswordShell">
        <input name="password" type={visible ? "text" : "password"} autoComplete="current-password" required />
        <button
          type="button"
          className="loginPasswordToggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={20} strokeWidth={1.8} /> : <Eye size={20} strokeWidth={1.8} />}
        </button>
      </span>
    </label>
  );
}
