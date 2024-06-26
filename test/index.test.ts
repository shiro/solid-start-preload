import { test, assert } from "vitest";
import { registerRoute } from "../src/index";
import { vi } from "vitest";

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

test("simple", () => {
  assert.equal(!!registerRoute, true);
});
