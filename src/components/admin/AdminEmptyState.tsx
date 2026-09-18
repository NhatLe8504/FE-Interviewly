import React from "react";
import { FolderOpen } from "lucide-react";

export interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminEmptyState({
  icon = <FolderOpen className="size-8 opacity-40 text-muted-foreground" />,
  title = "Không tìm thấy dữ liệu",
  description = "Thử thay đổi bộ lọc hoặc thêm mục mới.",
  action,
  className = "",
}: AdminEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center ${className}`}>
      <div className="mb-3 flex items-center justify-center">{icon}</div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
