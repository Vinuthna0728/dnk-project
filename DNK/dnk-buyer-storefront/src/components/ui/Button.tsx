// src/components/ui/Button.tsx
import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-usps-navy hover:bg-usps-slate text-white shadow-sm",
  secondary: "bg-slate-200 hover:bg-slate-300 text-usps-navy",
  ghost: "bg-transparent hover:bg-slate-100 text-usps-navy",
  outline: "bg-white border border-slate-300 hover:bg-slate-50 text-usps-navy",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded font-bold transition",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
