"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export interface Persona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  initials: string;
  company: string;
}

export const PERSONAS: Record<UserRole, Persona> = {
  ADMIN: {
    id: "11111111-1111-4111-a111-111111111111",
    name: "Sarah Connor",
    email: "admin@brightloop.io",
    role: "ADMIN",
    title: "System Administrator",
    initials: "SC",
    company: "Brightloop HQ",
  },
  STAFF: {
    id: "22222222-2222-4222-a222-222222222222",
    name: "Alex Rivera",
    email: "staff@brightloop.io",
    role: "STAFF",
    title: "Billing Specialist",
    initials: "AR",
    company: "Brightloop HQ",
  },
  CUSTOMER: {
    id: "33333333-3333-4333-a333-333333333333",
    name: "Liam Patel",
    email: "liam@acme.com",
    role: "CUSTOMER",
    title: "Acme Corp (Client)",
    initials: "AC",
    company: "Acme Corp",
  },
};

interface RoleContextType {
  role: UserRole;
  persona: Persona;
  setRole: (role: UserRole, customPersona?: Partial<Persona>) => void;
  canAccessRoute: (pathname: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [role, setRoleState] = useState<UserRole>("ADMIN");
  const [customPersona, setCustomPersona] = useState<Persona | null>(null);
  const [, startTransition] = useTransition();

  // Read initial role from URL query param or localStorage
  useEffect(() => {
    const roleParam = searchParams.get("role")?.toUpperCase();
    if (roleParam && (roleParam === "ADMIN" || roleParam === "STAFF" || roleParam === "CUSTOMER")) {
      setRoleState(roleParam as UserRole);
      localStorage.setItem("outloop_role", roleParam);
      return;
    }

    const saved = localStorage.getItem("outloop_role");
    if (saved && (saved === "ADMIN" || saved === "STAFF" || saved === "CUSTOMER")) {
      setRoleState(saved as UserRole);
    }
  }, [searchParams]);

  // guardrail: check role route permissions
  const canAccessRoute = (targetPath: string): boolean => {
    if (role === "CUSTOMER") {
      return (
        targetPath.startsWith("/portal") ||
        targetPath.startsWith("/subscriptions") ||
        targetPath.startsWith("/invoices")
      );
    }
    if (role === "STAFF") {
      return !targetPath.startsWith("/products") && !targetPath.startsWith("/settings");
    }
    return true;
  };

  const setRole = (newRole: UserRole, custom?: Partial<Persona>) => {
    setRoleState(newRole);
    localStorage.setItem("outloop_role", newRole);

    if (custom) {
      const initials = (custom.name || "User")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const merged: Persona = {
        ...PERSONAS[newRole],
        ...custom,
        initials,
      };
      setCustomPersona(merged);
    } else {
      setCustomPersona(null);
    }

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("role", newRole.toLowerCase());

      // Route protection redirect when switching persona
      if (
        newRole === "CUSTOMER" &&
        !pathname.startsWith("/portal") &&
        !pathname.startsWith("/subscriptions") &&
        !pathname.startsWith("/invoices")
      ) {
        router.push(`/portal?${params.toString()}`);
      } else if (
        newRole === "STAFF" &&
        (pathname.startsWith("/products") || pathname.startsWith("/settings"))
      ) {
        router.push(`/?${params.toString()}`);
      } else if (newRole !== "CUSTOMER" && pathname.startsWith("/portal")) {
        router.push(`/?${params.toString()}`);
      } else {
        router.replace(`${pathname}?${params.toString()}`);
      }
    });
  };

  const activePersona =
    customPersona && customPersona.role === role ? customPersona : PERSONAS[role];

  return (
    <RoleContext.Provider
      value={{
        role,
        persona: activePersona,
        setRole,
        canAccessRoute,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
