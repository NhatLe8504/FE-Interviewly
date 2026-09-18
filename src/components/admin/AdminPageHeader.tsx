import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";

export interface AdminPageHeaderProps {
  title: string;
  badge?: React.ReactNode;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  badge,
  description,
  backHref,
  backLabel = "Quay lại",
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="space-y-3">
      {backHref && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground text-xs"
          >
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
              <span>{backLabel}</span>
            </Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {badge && (
              <Badge variant="outline" className="font-semibold text-xs">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {children && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{children}</div>}
      </div>
    </div>
  );
}
