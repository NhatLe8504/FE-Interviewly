"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  className?: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemName = "bản ghi",
  className = "",
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  const startRecord = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, totalItems);

  // Calculate page buttons to show (e.g. 1 ... 4 5 6 ... 10)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (safeTotalPages <= 7) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("...");
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < safeTotalPages - 2) pages.push("...");
      pages.push(safeTotalPages);
    }
    return pages;
  };

  return (
    <div
      className={`p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground ${className}`}
    >
      {/* Records Count Info */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span>
          Hiển thị <strong>{startRecord}</strong> - <strong>{endRecord}</strong> trên tổng số{" "}
          <strong>{totalItems}</strong> {itemName}
        </span>

        {/* Optional Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-muted-foreground hidden sm:inline">Cỡ trang:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-[72px] text-xs">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Pagination Nav Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0"
          title="Trang đầu"
        >
          <ChevronsLeft className="size-3.5" />
          <span className="sr-only">Trang đầu</span>
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          className="h-8 px-2.5 gap-1 text-xs"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </Button>

        {/* Page Number Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="px-1.5 py-1 text-muted-foreground select-none">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={safeCurrentPage === p ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(Number(p))}
                className={`h-8 w-8 p-0 text-xs font-medium ${
                  safeCurrentPage === p
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "hover:bg-muted"
                }`}
              >
                {p}
              </Button>
            )
          )}
        </div>

        {/* Mobile current page indicator */}
        <span className="sm:hidden px-2 font-medium">
          {safeCurrentPage} / {safeTotalPages}
        </span>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage >= safeTotalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          className="h-8 px-2.5 gap-1 text-xs"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="size-3.5" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage >= safeTotalPages}
          onClick={() => onPageChange(safeTotalPages)}
          className="h-8 w-8 p-0"
          title="Trang cuối"
        >
          <ChevronsRight className="size-3.5" />
          <span className="sr-only">Trang cuối</span>
        </Button>
      </div>
    </div>
  );
}
