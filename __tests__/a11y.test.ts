// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  generateId,
  moveFocus,
  trapFocus,
  announce,
  prefersReducedMotion,
  getAnimationDuration,
} from "@/lib/a11y";

describe("Accessibility Utilities", () => {
  describe("generateId", () => {
    it("generates an ID with the given prefix", () => {
      const id = generateId("modal");
      expect(id).toMatch(/^modal-[a-z0-9]+$/);
    });

    it("generates unique IDs on successive calls", () => {
      const id1 = generateId("test");
      const id2 = generateId("test");
      expect(id1).not.toBe(id2);
    });
  });

  describe("moveFocus", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("focuses an element by its ID", () => {
      const el = document.createElement("button");
      el.id = "target-btn";
      document.body.appendChild(el);

      moveFocus("target-btn");
      expect(document.activeElement).toBe(el);
    });

    it("does nothing when element does not exist", () => {
      const before = document.activeElement;
      moveFocus("nonexistent");
      expect(document.activeElement).toBe(before);
    });
  });

  describe("trapFocus", () => {
    let container: HTMLDivElement;
    let cleanup: () => void;

    beforeEach(() => {
      document.body.innerHTML = "";
      container = document.createElement("div");
      const btn1 = document.createElement("button");
      btn1.textContent = "First";
      const btn2 = document.createElement("button");
      btn2.textContent = "Second";
      const btn3 = document.createElement("button");
      btn3.textContent = "Third";
      container.appendChild(btn1);
      container.appendChild(btn2);
      container.appendChild(btn3);
      document.body.appendChild(container);
    });

    afterEach(() => {
      if (cleanup) cleanup();
    });

    it("returns a cleanup function", () => {
      cleanup = trapFocus(container);
      expect(typeof cleanup).toBe("function");
    });

    it("wraps focus from last to first on Tab", () => {
      cleanup = trapFocus(container);
      const buttons = container.querySelectorAll("button");
      const last = buttons[buttons.length - 1];
      (last as HTMLElement).focus();

      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
      });
      const prevented = vi.spyOn(event, "preventDefault");
      container.dispatchEvent(event);

      expect(prevented).toHaveBeenCalled();
    });

    it("wraps focus from first to last on Shift+Tab", () => {
      cleanup = trapFocus(container);
      const buttons = container.querySelectorAll("button");
      (buttons[0] as HTMLElement).focus();

      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
      });
      const prevented = vi.spyOn(event, "preventDefault");
      container.dispatchEvent(event);

      expect(prevented).toHaveBeenCalled();
    });

    it("ignores non-Tab keys", () => {
      cleanup = trapFocus(container);
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      });
      const prevented = vi.spyOn(event, "preventDefault");
      container.dispatchEvent(event);

      expect(prevented).not.toHaveBeenCalled();
    });

    it("removes listener on cleanup", () => {
      cleanup = trapFocus(container);
      cleanup();

      const buttons = container.querySelectorAll("button");
      const last = buttons[buttons.length - 1];
      (last as HTMLElement).focus();

      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
      });
      const prevented = vi.spyOn(event, "preventDefault");
      container.dispatchEvent(event);

      expect(prevented).not.toHaveBeenCalled();
    });
  });

  describe("announce", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("creates an announcer element if none exists", () => {
      announce("Hello screen reader");
      const announcer = document.getElementById("aria-live-announcer");
      expect(announcer).not.toBeNull();
      expect(announcer?.textContent).toBe("Hello screen reader");
    });

    it("reuses existing announcer", () => {
      announce("First");
      announce("Second");
      const announcers = document.querySelectorAll("#aria-live-announcer");
      expect(announcers.length).toBe(1);
      expect(announcers[0].textContent).toBe("Second");
    });

    it("sets aria-live to polite by default", () => {
      announce("Polite message");
      const announcer = document.getElementById("aria-live-announcer");
      expect(announcer?.getAttribute("aria-live")).toBe("polite");
    });

    it("sets aria-live to assertive when specified", () => {
      announce("Urgent message", "assertive");
      const announcer = document.getElementById("aria-live-announcer");
      expect(announcer?.getAttribute("aria-live")).toBe("assertive");
    });

    it("clears the message after 1 second", () => {
      announce("Temporary");
      const announcer = document.getElementById("aria-live-announcer");
      expect(announcer?.textContent).toBe("Temporary");

      vi.advanceTimersByTime(1000);
      expect(announcer?.textContent).toBe("");
    });
  });

  describe("prefersReducedMotion", () => {
    beforeEach(() => {
      window.matchMedia = vi.fn();
    });

    it("returns true when user prefers reduced motion", () => {
      (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue({ matches: true });
      expect(prefersReducedMotion()).toBe(true);
    });

    it("returns false when user does not prefer reduced motion", () => {
      (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue({ matches: false });
      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe("getAnimationDuration", () => {
    beforeEach(() => {
      window.matchMedia = vi.fn();
    });

    it("returns 1ms when reduced motion is preferred", () => {
      (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue({ matches: true });
      expect(getAnimationDuration(300)).toBe(1);
    });

    it("returns the default when reduced motion is not preferred", () => {
      (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue({ matches: false });
      expect(getAnimationDuration(300)).toBe(300);
    });
  });
});
