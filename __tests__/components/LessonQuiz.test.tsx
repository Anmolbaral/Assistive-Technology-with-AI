// @vitest-environment jsdom
/**
 * Integration test for LessonQuiz — the bridge between
 * the Quiz UI component and the completion tracking system.
 *
 * This verifies the critical path:
 *   User answers quiz → Quiz calls onComplete → LessonQuiz calls markLessonComplete → localStorage updated
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/lessons/responsible-ai",
}));

vi.mock("@/lib/a11y", () => ({
  announce: vi.fn(),
}));

const mockMarkLessonComplete = vi.fn();
const mockQuizCompleted = vi.fn();
const mockLessonCompleted = vi.fn();

vi.mock("@/lib/completion", () => ({
  markLessonComplete: (...args: unknown[]) => mockMarkLessonComplete(...args),
  LessonSlug: {},
}));

vi.mock("@/lib/analytics", () => ({
  analytics: {
    quizCompleted: (...args: unknown[]) => mockQuizCompleted(...args),
    lessonCompleted: (...args: unknown[]) => mockLessonCompleted(...args),
  },
}));

import { LessonQuiz } from "@/components/LessonQuiz";

const questions = [
  {
    prompt: "AI can replace teachers.",
    options: ["True", "False"],
    answerIndex: 1,
  },
  {
    prompt: "It's safe to enter student names into AI tools.",
    options: ["True", "False"],
    answerIndex: 1,
  },
];

describe("LessonQuiz — Completion Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls markLessonComplete with the correct slug when quiz is passed", () => {
    render(<LessonQuiz questions={questions} />);

    // Answer Q1 correctly (False = index 1)
    fireEvent.click(screen.getByText("False"));
    fireEvent.click(screen.getByText("Next"));

    // Answer Q2 correctly (False = index 1) and submit
    fireEvent.click(screen.getByText("False"));
    fireEvent.click(screen.getByText("Submit Quiz"));

    // Verify the completion system was called with the slug extracted from the pathname
    expect(mockMarkLessonComplete).toHaveBeenCalledTimes(1);
    expect(mockMarkLessonComplete).toHaveBeenCalledWith("responsible-ai", true);
  });

  it("fires analytics events with correct slug and score on pass", () => {
    render(<LessonQuiz questions={questions} />);

    fireEvent.click(screen.getByText("False"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("False"));
    fireEvent.click(screen.getByText("Submit Quiz"));

    expect(mockQuizCompleted).toHaveBeenCalledWith("responsible-ai", 100);
    expect(mockLessonCompleted).toHaveBeenCalledWith("responsible-ai");
  });

  it("does NOT call markLessonComplete when quiz is failed", () => {
    render(<LessonQuiz questions={questions} />);

    // Answer Q1 wrong (True = index 0)
    fireEvent.click(screen.getByText("True"));
    fireEvent.click(screen.getByText("Next"));

    // Answer Q2 wrong (True = index 0)
    fireEvent.click(screen.getByText("True"));
    fireEvent.click(screen.getByText("Submit Quiz"));

    // Score is 0% which is below the 80% default threshold
    expect(mockMarkLessonComplete).not.toHaveBeenCalled();
    expect(mockQuizCompleted).not.toHaveBeenCalled();
    expect(mockLessonCompleted).not.toHaveBeenCalled();
  });

  it("does NOT fire analytics when quiz is failed", () => {
    render(<LessonQuiz questions={questions} />);

    fireEvent.click(screen.getByText("True"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("True"));
    fireEvent.click(screen.getByText("Submit Quiz"));

    expect(mockQuizCompleted).not.toHaveBeenCalled();
  });
});
