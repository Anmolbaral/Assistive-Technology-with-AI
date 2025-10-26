"use client";
import { useRole } from "@/lib/useRole";
import { useState, useEffect } from "react";

export default function RolePicker() {
  const [role, cfg, setRole] = useRole();
  const [isClient, setIsClient] = useState(false);
  
  const roleLabels = {
    teacher: "Teacher",
    at_specialist: "AT Specialist", 
    coach: "Coach"
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div role="group" aria-label="Choose your role" className="flex gap-2 flex-wrap">
        <div className="px-3 py-1 rounded text-sm font-medium bg-primary text-primary-foreground">
          Teacher
        </div>
        <div className="px-3 py-1 rounded text-sm font-medium bg-muted text-muted-foreground">
          AT Specialist
        </div>
        <div className="px-3 py-1 rounded text-sm font-medium bg-muted text-muted-foreground">
          Coach
        </div>
      </div>
    );
  }

  const resetRoleSelection = () => {
    sessionStorage.removeItem("techbridge-role-selected-session");
    window.location.reload();
  };

  return (
    <div role="group" aria-label="Choose your role" className="flex gap-2 flex-wrap items-center">
      {(["teacher", "at_specialist", "coach"] as const).map((k) => (
        <button
          key={k}
          onClick={() => setRole(k)}
          aria-pressed={role === k}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            role === k 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {roleLabels[k]}
        </button>
      ))}
      
      {/* Reset button for testing */}
      <button
        onClick={resetRoleSelection}
        className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        title="Reset role selection (for testing)"
      >
        Reset
      </button>
    </div>
  );
}
