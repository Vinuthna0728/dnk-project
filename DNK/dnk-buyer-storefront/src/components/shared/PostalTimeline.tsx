"use client";

import { CheckCircle2, Clock, Truck, Home } from "lucide-react";

interface PostalTimelineProps {
  currentStatus: "BOOKED" | "CUSTOMS_CLEARED" | "IN_TRANSIT" | "DELIVERED";
}

export default function PostalTimeline({ currentStatus }: PostalTimelineProps) {
  const steps = [
    { key: "BOOKED", label: "Parcel Booked", desc: "Dak Ghar Niryat Kendra Intake", icon: Clock },
    { key: "CUSTOMS_CLEARED", label: "Hub / LEO Approved", desc: "Customs Clearance & Sorting", icon: CheckCircle2 },
    { key: "IN_TRANSIT", label: "In-Transit", desc: "Air Mail / Surface Rail", icon: Truck },
    { key: "DELIVERED", label: "Delivered", desc: "Final Doorstep Delivery", icon: Home },
  ];

  const statusOrder = ["BOOKED", "CUSTOMS_CLEARED", "IN_TRANSIT", "DELIVERED"];
  const activeIdx = statusOrder.indexOf(currentStatus);

  return (
    <div className="w-full py-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const isDone = idx <= activeIdx;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${isDone ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-neutral-50 border-neutral-200 text-neutral-400"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDone ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-400"
                  }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold">{step.label}</h4>
              <p className="text-[11px] mt-1 opacity-80">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}