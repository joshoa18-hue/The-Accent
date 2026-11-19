// Adds DOM matchers such as toBeInTheDocument() and toHaveAttribute() to expect().
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount rendered components after every test so tests never affect each other.
afterEach(() => {
  cleanup();
});
