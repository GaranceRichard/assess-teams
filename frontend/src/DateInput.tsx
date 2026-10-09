import { useState } from "react";

import { dateInputLabel, parseDateInput } from "./dateInputValue";

type Props = {
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  min?: string;
  required?: boolean;
};

export function DateInput({
  value,
  onChange,
  withTime = false,
  min,
  required,
}: Props) {
  const [previousValue, setPreviousValue] = useState(value);
  const [label, setLabel] = useState(dateInputLabel(value, withTime));
  if (value !== previousValue) {
    setPreviousValue(value);
    setLabel(dateInputLabel(value, withTime));
  }
  const parsed = parseDateInput(label, withTime);
  // Reusing the original value preserves hidden seconds and fractional precision.
  const next = label === dateInputLabel(value, withTime) ? value : parsed;
  const format = withTime ? "JJ/MM/AAAA - HH:mm" : "JJ/MM/AAAA";
  const error =
    next === null
      ? `Utilisez le format ${format} avec une date valide.`
      : next && min && next < min
        ? `La date doit être au moins ${dateInputLabel(min, withTime)}.`
        : "";

  return (
    <input
      type="text"
      inputMode="text"
      placeholder={format}
      title={format}
      required={required}
      value={label}
      ref={(input) => input?.setCustomValidity(error)}
      onChange={(event) => {
        const text = event.target.value;
        setLabel(text);
        const candidate = parseDateInput(text, withTime);
        if (candidate !== null) {
          const precise =
            text === dateInputLabel(value, withTime) ? value : candidate;
          onChange(precise);
        }
      }}
    />
  );
}
