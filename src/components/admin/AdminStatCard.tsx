import React from "react";
import { Card, CardContent } from "@/components/admin/ui/card";

export interface AdminStatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  iconClassName?: string;
  description?: React.ReactNode;
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  icon,
  iconClassName = "bg-primary/10 text-primary",
  description,
  className = "",
}: AdminStatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4 flex items-center gap-3.5">
        <div
          className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${iconClassName}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
          <div className="text-xl font-bold text-foreground tracking-tight">{value}</div>
          {description && (
            <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
