// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockSetRole = vi.fn();

vi.mock("@/lib/useRole", () => ({
  useRole: () => ["teacher", { label: "Teacher" }, mockSetRole],
}));

import RolePicker from "@/components/RolePicker";

describe("RolePicker Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("calls setRole when AT Specialist is clicked", async () => {
    render(<RolePicker />);
    // Wait for client-side render
    await vi.waitFor(() => {
      expect(screen.getByText("AT Specialist")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("AT Specialist"));
    expect(mockSetRole).toHaveBeenCalledWith("at_specialist");
  });

  it("calls setRole when Coach is clicked", async () => {
    render(<RolePicker />);
    await vi.waitFor(() => {
      expect(screen.getByText("Coach")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Coach"));
    expect(mockSetRole).toHaveBeenCalledWith("coach");
  });
});
