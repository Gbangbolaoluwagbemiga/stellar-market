"use client";

import { Loader2 } from "lucide-react";

/** Matches the backend DisputeStatus Prisma enum. */
type DisputeStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | string;

/** Matches the backend `outcome` string stored on a resolved dispute. */
type DisputeOutcome = "CLIENT" | "FREELANCER" | "SPLIT" | string | null | undefined;

interface DisputeOutcomeBannerProps {
  status: DisputeStatus;
  outcome?: DisputeOutcome;
  clientSplit?: number;
  freelancerSplit?: number;
}

const CONFIG: Record<
  string,
  { bg: string; border: string; text: string; heading: string }
> = {
  CLIENT: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    heading: "Client Dispute Won",
  },
  FREELANCER: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-600 dark:text-green-400",
    heading: "Freelancer Verdict",
  },
  SPLIT: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    heading: "Split Decision",
  },
};

export default function DisputeOutcomeBanner({
  status,
  outcome,
  clientSplit,
  freelancerSplit,
}: DisputeOutcomeBannerProps) {
  const cfg = outcome ? CONFIG[outcome] : undefined;

  if (status !== "RESOLVED" || !cfg) {
    // Pending / in-progress state
    return (
      <div className="flex items-center gap-3 rounded-lg border border-gray-300/40 bg-gray-500/10 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        <Loader2 className="animate-spin shrink-0" size={16} />
        <span>Dispute pending — awaiting resolution</span>
      </div>
    );
  }

  return (
    <div
      data-testid="dispute-outcome-banner"
      className={`rounded-lg border px-4 py-3 ${cfg.bg} ${cfg.border}`}
    >
      <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.heading}</p>
      {outcome === "SPLIT" &&
        clientSplit != null &&
        freelancerSplit != null && (
          <p className={`mt-1 text-xs ${cfg.text}`}>
            Client {clientSplit}% · Freelancer {freelancerSplit}%
          </p>
        )}
    </div>
  );
}
