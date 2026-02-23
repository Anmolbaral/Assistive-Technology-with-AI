// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockSetRole = vi.fn();
let currentRole = "teacher";

vi.mock("@/lib/useRole", () => ({
  useRole: () => {
    const setRole = (newRole: string) => {
      currentRole = newRole;
      mockSetRole(newRole);
    };
    const configs: Record<string, { label: string }> = {
      teacher: { label: "Teacher" },
      at_specialist: { label: "AT Specialist" },
      coach: { label: "Instructional/Technology Coach" },
    };
    return [currentRole, configs[currentRole], setRole];
  },
}));

import RolePicker from "@/components/roles/RolePicker";

describe("RolePicker Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentRole = "teacher";
  });

  it("renders all three role buttons", () => {
    render(<RolePicker />);
    expect(screen.getByText("Teacher")).toBeInTheDocument();
    expect(screen.getByText("AT Specialist")).toBeInTheDocument();
    expect(screen.getByText("Coach")).toBeInTheDocument();
  });

  it("has a group role with accessible label", () => {
    render(<RolePicker />);
    expect(screen.getByRole("group", { name: /choose your role/i })).toBeInTheDocument();
  });

  it("renders a Reset button", () => {
    render(<RolePicker />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("calls setRole with 'at_specialist' when AT Specialist is clicked", async () => {
    render(<RolePicker />);
    await vi.waitFor(() => {
      expect(screen.getByText("AT Specialist")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("AT Specialist"));
    expect(mockSetRole).toHaveBeenCalledWith("at_specialist");
  });

  it("calls setRole with 'coach' when Coach is clicked", async () => {
    render(<RolePicker />);
    await vi.waitFor(() => {
      expect(screen.getByText("Coach")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Coach"));
    expect(mockSetRole).toHaveBeenCalledWith("coach");
  });

  it("calls setRole with 'teacher' when Teacher is clicked after switching", async () => {
    currentRole = "coach";
    render(<RolePicker />);
    await vi.waitFor(() => {
      expect(screen.getByText("Teacher")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Teacher"));
    expect(mockSetRole).toHaveBeenCalledWith("teacher");
  });

  it("uses aria-pressed to indicate the active role", async () => {
    render(<RolePicker />);
    await vi.waitFor(() => {
      const teacherBtn = screen.getByText("Teacher").closest("button");
      expect(teacherBtn).toHaveAttribute("aria-pressed", "true");
    });

    const specialistBtn = screen.getByText("AT Specialist").closest("button");
    expect(specialistBtn).toHaveAttribute("aria-pressed", "false");
  });
});
