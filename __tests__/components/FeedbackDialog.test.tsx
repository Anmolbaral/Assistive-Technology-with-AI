// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedbackDialog } from "@/components/FeedbackDialog";

vi.mock("@/lib/analytics", () => ({
  analytics: {
    lessonFeedback: vi.fn(),
    chatFeedback: vi.fn(),
  },
}));

import { analytics } from "@/lib/analytics";

describe("FeedbackDialog Component", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the dialog with title", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    expect(screen.getByText("Quick Feedback")).toBeInTheDocument();
  });

  it("shows correct context text for chat", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    expect(screen.getByText(/Was this answer clear and helpful/)).toBeInTheDocument();
  });

  it("shows correct context text for lesson", () => {
    render(<FeedbackDialog context="lesson" onClose={mockOnClose} />);
    expect(screen.getByText(/Was this lesson clear and helpful/)).toBeInTheDocument();
  });

  it("disables submit when no rating selected", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    expect(screen.getByText("Submit Feedback")).toBeDisabled();
  });

  it("enables submit after selecting a rating", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText("Yes, it was helpful"));
    expect(screen.getByText("Submit Feedback")).not.toBeDisabled();
  });

  it("calls onClose when Skip is clicked", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    fireEvent.click(screen.getByText("Skip"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when X button is clicked", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText("Close feedback dialog"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows thank you message after submission", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText("Yes, it was helpful"));
    fireEvent.click(screen.getByText("Submit Feedback"));
    expect(screen.getByText("Thank you!")).toBeInTheDocument();
  });

  it("tracks chatFeedback analytics on submit", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText("No, it was not helpful"));
    fireEvent.click(screen.getByText("Submit Feedback"));
    expect(analytics.chatFeedback).toHaveBeenCalledWith(false);
  });

  it("tracks lessonFeedback analytics on submit", () => {
    render(
      <FeedbackDialog context="lesson" lessonSlug="data-privacy" onClose={mockOnClose} />
    );
    fireEvent.click(screen.getByLabelText("Yes, it was helpful"));
    fireEvent.click(screen.getByText("Submit Feedback"));
    expect(analytics.lessonFeedback).toHaveBeenCalledWith("data-privacy", true);
  });

  it("calls onSubmit callback with feedback data", () => {
    render(
      <FeedbackDialog context="chat" onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );
    fireEvent.click(screen.getByLabelText("Yes, it was helpful"));
    fireEvent.click(screen.getByText("Submit Feedback"));
    expect(mockOnSubmit).toHaveBeenCalledWith({ helpful: true, comments: "" });
  });

  it("stores feedback in localStorage", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText("Yes, it was helpful"));
    fireEvent.click(screen.getByText("Submit Feedback"));

    const stored = JSON.parse(localStorage.getItem("feedback-data") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].helpful).toBe(true);
    expect(stored[0].context).toBe("chat");
  });

  it("auto-closes after 2 seconds on submit", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText("Yes, it was helpful"));
    fireEvent.click(screen.getByText("Submit Feedback"));

    expect(mockOnClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("has proper dialog ARIA attributes", () => {
    render(<FeedbackDialog context="chat" onClose={mockOnClose} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
