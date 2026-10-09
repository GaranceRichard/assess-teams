import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { DateInput } from "./DateInput";
import { parseDateInput } from "./dateInputValue";

it("edits a human date and emits only an ISO calendar date", () => {
  const change = vi.fn();
  const view = render(
    <DateInput value="2026-10-09" onChange={change} required />,
  );
  const input = screen.getByRole("textbox");
  expect(input).toHaveValue("09/10/2026");
  expect(input).toHaveAttribute("placeholder", "JJ/MM/AAAA");
  fireEvent.change(input, { target: { value: "10/10/2026" } });
  expect(change).toHaveBeenLastCalledWith("2026-10-10");
  view.rerender(<DateInput value="" onChange={change} required />);
  expect(input).toHaveValue("");
  expect(input).toBeInvalid();
});

it("preserves hidden precision until the visible minute changes", () => {
  const change = vi.fn();
  const original = "2026-10-09T09:05:47.123";
  render(<DateInput value={original} onChange={change} withTime />);
  const input = screen.getByRole("textbox");
  expect(input).toHaveValue("09/10/2026 - 09:05");
  fireEvent.change(input, { target: { value: "09/10/2026 - 09:0" } });
  expect(input).toBeInvalid();
  expect(change).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "09/10/2026 - 09:05" } });
  expect(change).toHaveBeenLastCalledWith(original);
  fireEvent.change(input, { target: { value: "09/10/2026 - 09:06" } });
  expect(change).toHaveBeenLastCalledWith("2026-10-09T09:06");
});

it("refuses nonexistent calendar dates and enforces the existing minimum", () => {
  const change = vi.fn();
  render(<DateInput value="" min="2026-10-09" onChange={change} />);
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "31/02/2026" } });
  expect(input).toBeInvalid();
  expect(change).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "08/10/2026" } });
  expect(input).toBeInvalid();
  fireEvent.change(input, { target: { value: "09/10/2026" } });
  expect(input).toBeValid();
  fireEvent.change(input, { target: { value: "" } });
  expect(change).toHaveBeenLastCalledWith("");
  expect(input).toBeValid();
});

it("validates the datetime range without exposing seconds", () => {
  render(
    <DateInput
      value="2026-10-09T09:05"
      min="2026-10-09T12:00"
      withTime
      onChange={vi.fn()}
    />,
  );
  expect(screen.getByRole("textbox")).toBeInvalid();
  expect(screen.getByRole("textbox")).toHaveAttribute(
    "title",
    "JJ/MM/AAAA - HH:mm",
  );
});

it.each([
  "31/04/2026",
  "29/02/2026",
  "01/13/2026",
  "00/01/2026",
  "01/01/0000",
  "2026-10-09",
])("rejects invalid date %s", (value) =>
  expect(parseDateInput(value, false)).toBeNull(),
);
it.each([
  "09/10/2026 - 24:00",
  "09/10/2026 - 12:60",
  "09/10/2026 - 9:05",
  "09/10/2026 - 09:05:47",
])("rejects invalid time %s", (value) =>
  expect(parseDateInput(value, true)).toBeNull(),
);
it("accepts leap days, midnight and noon", () => {
  expect(parseDateInput("29/02/2028", false)).toBe("2028-02-29");
  expect(parseDateInput("09/10/2026 - 00:00", true)).toBe("2026-10-09T00:00");
  expect(parseDateInput("09/10/2026 - 12:00", true)).toBe("2026-10-09T12:00");
});
