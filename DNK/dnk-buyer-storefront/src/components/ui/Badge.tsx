// src/components/ui/Badge.tsx
import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "navy" | "gold" | "emerald" | "slate";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  navy: "bg-usps-navy text-white",
  gold: "bg-dnk-yellow text-usps-navy",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  slate: "bg-slate-100 text-slate-700 border border-slate-200",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
}

export default function Badge({ children, variant = "navy", icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
