// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Quiz, type QuizQuestion } from "@/components/Quiz";

vi.mock("@/lib/a11y", () => ({
  announce: vi.fn(),
}));

const sampleQuestions: QuizQuestion[] = [
  {
    prompt: "What does SETT stand for?",
    options: [
      "Student, Environment, Tasks, Tools",
      "System, Education, Teaching, Technology",
      "Student, Evaluation, Training, Tools",
    ],
    answerIndex: 0,
    feedback: "SETT = Student, Environment, Tasks, Tools",
  },
  {
    prompt: "Which is a low-tech AT solution?",
    options: ["iPad with AAC app", "Pencil grip", "Speech-to-text software"],
    answerIndex: 1,
  },
  {
    prompt: "FERPA protects what?",
    options: ["Teacher salaries", "Student education records", "School budgets"],
    answerIndex: 1,
  },
];

describe("Quiz Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the first question", () => {
    render(<Quiz questions={sampleQuestions} />);
    expect(screen.getByText("What does SETT stand for?")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
  });

  it("renders all answer options", () => {
    render(<Quiz questions={sampleQuestions} />);
    expect(screen.getByText("Student, Environment, Tasks, Tools")).toBeInTheDocument();
    expect(screen.getByText("System, Education, Teaching, Technology")).toBeInTheDocument();
  });

  it("shows progress bar", () => {
    render(<Quiz questions={sampleQuestions} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("disables Next button when no answer selected", () => {
    render(<Quiz questions={sampleQuestions} />);
    const buttons = screen.getAllByRole("button");
    const nextBtn = buttons.find((b) => b.textContent === "Next");
    expect(nextBtn).toBeDisabled();
  });

  it("enables Next button after selecting an answer", () => {
    render(<Quiz questions={sampleQuestions} />);
    fireEvent.click(screen.getByText("Student, Environment, Tasks, Tools"));
    const nextBtn = screen.getAllByRole("button").find((b) => b.textContent === "Next");
    expect(nextBtn).not.toBeDisabled();
  });

  it("advances to the next question on Next click", () => {
    render(<Quiz questions={sampleQuestions} />);
    fireEvent.click(screen.getByText("Student, Environment, Tasks, Tools"));
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Which is a low-tech AT solution?")).toBeInTheDocument();
    expect(screen.getByText("Question 2 of 3")).toBeInTheDocument();
  });

  it("shows Previous button after first question", () => {
    render(<Quiz questions={sampleQuestions} />);
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Student, Environment, Tasks, Tools"));
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Previous")).toBeInTheDocument();
  });

  it("goes back to previous question on Previous click", () => {
    render(<Quiz questions={sampleQuestions} />);
    fireEvent.click(screen.getByText("Student, Environment, Tasks, Tools"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Previous"));
    expect(screen.getByText("What does SETT stand for?")).toBeInTheDocument();
  });

  it("shows Submit Quiz on last question", () => {
    render(<Quiz questions={sampleQuestions} />);
    // Q1
    fireEvent.click(screen.getByText("Student, Environment, Tasks, Tools"));
    fireEvent.click(screen.getByText("Next"));
    // Q2
    fireEvent.click(screen.getByText("Pencil grip"));
    fireEvent.click(screen.getByText("Next"));
    // Q3 - last
    expect(screen.getByText("Submit Quiz")).toBeInTheDocument();
  });

  it("shows results after submission with passing score", () => {
    const onComplete = vi.fn();
    render(<Quiz questions={sampleQuestions} onComplete={onComplete} passingScore={60} />);

    // Answer all correctly
    fireEvent.click(screen.getByText("Student, Environment, Tasks, Tools"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Pencil grip"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Student education records"));
    fireEvent.click(screen.getByText("Submit Quiz"));

    expect(screen.getByText("Quiz Results")).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getByText(/Congratulations/)).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith(true, 100);
  });

  it("shows retry button on failing score", () => {
    const onComplete = vi.fn();
    render(<Quiz questions={sampleQuestions} onComplete={onComplete} passingScore={80} />);

    // Answer all wrong
    fireEvent.click(screen.getByText("System, Education, Teaching, Technology"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("iPad with AAC app"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Teacher salaries"));
    fireEvent.click(screen.getByText("Submit Quiz"));

    expect(screen.getByText(/Score: 0%/)).toBeInTheDocument();
    expect(screen.getByText("Retry Quiz")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith(false, 0);
  });

  it("resets quiz on retry", () => {
    render(<Quiz questions={sampleQuestions} passingScore={100} />);

    // Answer all wrong
    fireEvent.click(screen.getByText("System, Education, Teaching, Technology"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("iPad with AAC app"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Teacher salaries"));
    fireEvent.click(screen.getByText("Submit Quiz"));

    fireEvent.click(screen.getByText("Retry Quiz"));

    expect(screen.getByText("What does SETT stand for?")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
  });

  it("shows feedback text in review", () => {
    render(<Quiz questions={sampleQuestions} passingScore={0} />);

    fireEvent.click(screen.getByText("Student, Environment, Tasks, Tools"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Pencil grip"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Student education records"));
    fireEvent.click(screen.getByText("Submit Quiz"));

    expect(screen.getByText("SETT = Student, Environment, Tasks, Tools")).toBeInTheDocument();
  });
});
