import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// JSDOM does not implement the browser's native dialog lifecycle.
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};

// JSDOM exposes popover styling but not its native top-layer lifecycle.
HTMLElement.prototype.showPopover = function () {
  this.style.display = "block";
};
HTMLElement.prototype.hidePopover = function () {
  this.style.display = "none";
};
