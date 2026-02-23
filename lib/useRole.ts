"use client";
import { useEffect, useState } from "react";
import { ROLES, type RoleKey, type RoleConfig } from "./roles";

const KEY = "techbridge-role";

export function useRole(): [RoleKey, RoleConfig, (r: RoleKey) => void] {
  const [role, setRole] = useState<RoleKey>("teacher");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load from localStorage after hydration
    const savedRole = localStorage.getItem(KEY) as RoleKey;
    if (savedRole && ROLES[savedRole]) {
      setRole(savedRole);
    }
  }, []);

  // Listen for role changes from other components
  useEffect(() => {
    if (!isClient) return;
    
    const handleRoleChange = () => {
      const savedRole = localStorage.getItem(KEY) as RoleKey;
      if (savedRole && ROLES[savedRole] && savedRole !== role) {
        setRole(savedRole);
      }
    };

    // Listen for storage events (when localStorage changes)
    window.addEventListener('storage', handleRoleChange);
    
    // Also listen for custom role change events
    window.addEventListener('roleChanged', handleRoleChange);

    return () => {
      window.removeEventListener('storage', handleRoleChange);
      window.removeEventListener('roleChanged', handleRoleChange);
    };
  }, [isClient, role]);

  const setRoleWithPersistence = (newRole: RoleKey) => {
    setRole(newRole);
    if (isClient) {
      localStorage.setItem(KEY, newRole);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('roleChanged', { detail: newRole }));
    }
  };

  return [role, ROLES[role], setRoleWithPersistence];
}
