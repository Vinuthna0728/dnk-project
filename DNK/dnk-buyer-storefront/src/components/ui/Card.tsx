// src/components/ui/Card.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export default function Card({ children, className, padded = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-postal-border shadow-sm",
        padded && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
