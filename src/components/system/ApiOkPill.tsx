import React from "react";
import { useApiHealth } from "@/hooks/useApiHealth";

export default function ApiOkPill() {
  const health = useApiHealth();
  if (health.status !== "ok") return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600" />
      API OK{health.version ? ` v${health.version}` : ""}
    </span>
  );
}
