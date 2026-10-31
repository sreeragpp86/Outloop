"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRole, PERSONAS, UserRole } from "@/context/RoleContext";
import { Check, ChevronDown, Shield, User, Building2 } from "lucide-react";

export function PersonaSwitcher() {
  const { role, persona, setRole } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadgeClass = (r: UserRole) => {
    switch (r) {
      case "ADMIN":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "STAFF":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "CUSTOMER":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    }
  };

  const getRoleIcon = (r: UserRole) => {
    switch (r) {
      case "ADMIN":
        return Shield;
      case "STAFF":
        return User;
      case "CUSTOMER":
        return Building2;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-lg border border-zinc-200/90 bg-white px-2.5 py-1.5 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {persona.initials}
        </div>

        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {persona.name}
            </span>
            <span
              className={`rounded border px-1.5 py-0.2 text-[10px] font-mono font-medium ${getRoleBadgeClass(
                role
              )}`}
            >
              {role}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-none mt-0.5">
            {persona.company}
          </p>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-72 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
            Switch Active Persona
          </div>

          <div className="mt-1 space-y-1">
            {(Object.keys(PERSONAS) as UserRole[]).map((r) => {
              const p = PERSONAS[r];
              const isSelected = role === r;
              const Icon = getRoleIcon(r);

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors active:scale-[0.98] ${
                    isSelected
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                    <Icon className="h-3 w-3" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">
                        {p.name}
                      </span>
                      <span
                        className={`rounded border px-1 py-0.2 text-[9px] font-mono font-medium ${getRoleBadgeClass(
                          r
                        )}`}
                      >
                        {r}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {p.email}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {p.company} • {p.title}
                    </p>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-zinc-900 dark:text-zinc-100 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
