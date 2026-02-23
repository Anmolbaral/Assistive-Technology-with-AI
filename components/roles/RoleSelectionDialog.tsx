"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Lightbulb } from "lucide-react";
import { useRole } from "@/lib/useRole";
import { ROLES, type RoleKey } from "@/lib/roles";

const ROLE_ICONS = {
  teacher: GraduationCap,
  at_specialist: Users,
  coach: Lightbulb,
};

const ROLE_DESCRIPTIONS = {
  teacher: "Classroom educators looking for practical AT solutions",
  at_specialist: "AT professionals seeking evidence-based recommendations", 
  coach: "Instructional leaders building AT capacity across schools",
};

export default function RoleSelectionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, , setRole] = useRole();

  useEffect(() => {
    // Check if user has already selected a role in this session
    const hasSelectedRole = sessionStorage.getItem("techbridge-role-selected-session");
    
    if (!hasSelectedRole) {
      // Show dialog after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRoleSelect = (selectedRole: RoleKey) => {
    console.log("Selecting role:", selectedRole);
    
    // Set localStorage and dispatch event
    localStorage.setItem("techbridge-role", selectedRole);
    sessionStorage.setItem("techbridge-role-selected-session", "true");
    
    // Dispatch custom event to notify useRole hook
    window.dispatchEvent(new CustomEvent('roleChanged', { detail: selectedRole }));
    
    // Also call setRole directly
    setRole(selectedRole);
    
    console.log("Role set to:", selectedRole, "Banner should be:", ROLES[selectedRole].banner);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to TechBridge Learning!
          </CardTitle>
          <p className="text-muted-foreground">
            To provide you with the most relevant content, please select your role:
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {(["teacher", "at_specialist", "coach"] as const).map((roleKey) => {
            const Icon = ROLE_ICONS[roleKey];
            const config = ROLES[roleKey];
            
            return (
              <button
                key={roleKey}
                onClick={() => handleRoleSelect(roleKey)}
                className="w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{config.label}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {roleKey === "teacher" ? "Most Popular" : ""}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {ROLE_DESCRIPTIONS[roleKey]}
                    </p>
                    
                    <div className="text-sm">
                      <p className="font-medium text-primary mb-1">Sample questions:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {config.sampleQueries.slice(0, 2).map((query, idx) => (
                          <li key={idx} className="text-xs">
                            • {query}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              You can change your role anytime using the role selector in the header.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
