// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("plausible-tracker", () => {
  const trackEvent = vi.fn();
  const trackPageview = vi.fn();
  return {
    default: () => ({ trackEvent, trackPageview }),
    __mocks: { trackEvent, trackPageview },
  };
});

import { trackEvent, trackPageview, analytics } from "@/lib/analytics";
import { __mocks } from "plausible-tracker";
const { trackEvent: mockTrackEvent, trackPageview: mockTrackPageview } =
  __mocks as { trackEvent: ReturnType<typeof vi.fn>; trackPageview: ReturnType<typeof vi.fn> };

describe("Analytics", () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
    mockTrackPageview.mockClear();
  });

  describe("trackEvent", () => {
    it("calls plausible trackEvent with the event name", () => {
      trackEvent("test_event");
      expect(mockTrackEvent).toHaveBeenCalledWith("test_event", { props: undefined });
    });

    it("passes props through to plausible", () => {
      trackEvent("test_event", { slug: "lesson-1", score: 90 });
      expect(mockTrackEvent).toHaveBeenCalledWith("test_event", {
        props: { slug: "lesson-1", score: 90 },
      });
    });

    it("handles plausible errors gracefully", () => {
      mockTrackEvent.mockImplementationOnce(() => {
        throw new Error("Network error");
      });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => trackEvent("broken")).not.toThrow();
      spy.mockRestore();
    });
  });

  describe("trackPageview", () => {
    it("calls plausible trackPageview", () => {
      trackPageview();
      expect(mockTrackPageview).toHaveBeenCalled();
    });

    it("handles plausible errors gracefully", () => {
      mockTrackPageview.mockImplementationOnce(() => {
        throw new Error("Network error");
      });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => trackPageview()).not.toThrow();
      spy.mockRestore();
    });
  });

  describe("analytics object", () => {
    it("tracks lessonStarted", () => {
      analytics.lessonStarted("responsible-ai");
      expect(mockTrackEvent).toHaveBeenCalledWith("lesson_started", {
        props: { slug: "responsible-ai" },
      });
    });

    it("tracks lessonCompleted", () => {
      analytics.lessonCompleted("data-privacy");
      expect(mockTrackEvent).toHaveBeenCalledWith("lesson_completed", {
        props: { slug: "data-privacy" },
      });
    });

    it("tracks quizCompleted with slug and score", () => {
      analytics.quizCompleted("prompt-engineering", 85);
      expect(mockTrackEvent).toHaveBeenCalledWith("quiz_completed", {
        props: { slug: "prompt-engineering", score: 85 },
      });
    });

    it("tracks assistantOpened", () => {
      analytics.assistantOpened();
      expect(mockTrackEvent).toHaveBeenCalledWith("assistant_opened", {
        props: undefined,
      });
    });

    it("tracks assistantQuery with length only (no content)", () => {
      analytics.assistantQuery(42);
      expect(mockTrackEvent).toHaveBeenCalledWith("assistant_query", {
        props: { query_length: 42 },
      });
    });

    it("tracks piiBlocked with hint category", () => {
      analytics.piiBlocked("name");
      expect(mockTrackEvent).toHaveBeenCalledWith("pii_blocked", {
        props: { hint: "name" },
      });
    });

    it("tracks piiBlocked with general when no hint", () => {
      analytics.piiBlocked();
      expect(mockTrackEvent).toHaveBeenCalledWith("pii_blocked", {
        props: { hint: "general" },
      });
    });

    it("tracks trainingComplete", () => {
      analytics.trainingComplete();
      expect(mockTrackEvent).toHaveBeenCalledWith("training_complete", {
        props: undefined,
      });
    });

    it("tracks certificateDownloaded", () => {
      analytics.certificateDownloaded();
      expect(mockTrackEvent).toHaveBeenCalledWith("certificate_downloaded", {
        props: undefined,
      });
    });

    it("tracks lessonFeedback", () => {
      analytics.lessonFeedback("sett-framework", true);
      expect(mockTrackEvent).toHaveBeenCalledWith("lesson_feedback", {
        props: { slug: "sett-framework", helpful: true },
      });
    });

    it("tracks chatFeedback", () => {
      analytics.chatFeedback(false);
      expect(mockTrackEvent).toHaveBeenCalledWith("chat_feedback", {
        props: { helpful: false },
      });
    });
  });
});
