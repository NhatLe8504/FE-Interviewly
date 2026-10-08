"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./Pagination.module.css";

/* -------------------------------------------------------------------------- */
/* Low-level Shadcn-styled primitives for User Portal                        */
/* -------------------------------------------------------------------------- */

export function Pagination({
  className = "",
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={`${styles.nav} ${className}`}
      {...props}
    />
  );
}

export function PaginationContent({
  className = "",
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul className={`${styles.list} ${className}`} {...props} />
  );
}

export function PaginationItem({
  className = "",
  ...props
}: React.ComponentProps<"li">) {
  return <li className={`${styles.item} ${className}`} {...props} />;
}

export interface PaginationLinkProps extends React.ComponentProps<"button"> {
  isActive?: boolean;
}

export function PaginationLink({
  className = "",
  isActive = false,
  children,
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      type="button"
      variant={isActive ? "home-primary" : "home-outline"}
      size="home-compact"
      aria-current={isActive ? "page" : undefined}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

export interface PaginationNavButtonProps extends React.ComponentProps<"button"> {
  label?: string;
}

export function PaginationPrevious({
  className = "",
  label = "Trước",
  ...props
}: PaginationNavButtonProps) {
  return (
    <Button
      type="button"
      variant="home-outline"
      size="home-compact"
      aria-label="Trang trước"
      className={className}
      {...props}
    >
      <ChevronLeft size={14} aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}

export function PaginationNext({
  className = "",
  label = "Sau",
  ...props
}: PaginationNavButtonProps) {
  return (
    <Button
      type="button"
      variant="home-outline"
      size="home-compact"
      aria-label="Trang kế tiếp"
      className={className}
      {...props}
    >
      <span>{label}</span>
      <ChevronRight size={14} aria-hidden="true" />
    </Button>
  );
}

export function PaginationEllipsis({
  className = "",
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.ellipsis} ${className}`}
      {...props}
    >
      <MoreHorizontal size={14} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* High-level All-in-one Reusable UserPagination Component                    */
/* -------------------------------------------------------------------------- */

export interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  showInfo?: boolean;
  className?: string;
  prevLabel?: string;
  nextLabel?: string;
  itemLabel?: string;
  disabled?: boolean;
  controlsId?: string;
  ariaLabel?: string;
}

export function UserPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 6,
  showInfo = true,
  className = "",
  prevLabel = "Trước",
  nextLabel = "Sau",
  itemLabel = "câu hỏi",
  disabled = false,
  controlsId,
  ariaLabel = "Phân trang",
}: UserPaginationProps) {
  if (totalPages <= 1 && !totalItems) {
    return null;
  }

  // Calculate visible range info
  const startItem = totalItems ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : 0;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  // Generate page numbers with ellipses
  const generatePages = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  const pages = generatePages();

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {/* Information text */}
      {showInfo && totalItems !== undefined && (
        <div className={styles.info}>
          Hiển thị{" "}
          <span className={styles.infoHighlight}>
            {totalItems > 0 ? `${startItem} - ${endItem}` : 0}
          </span>{" "}
          trong tổng số{" "}
          <span className={styles.infoHighlight}>{totalItems}</span> {itemLabel}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination aria-label={ariaLabel}>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              <PaginationPrevious
                disabled={disabled || currentPage <= 1}
                aria-controls={controlsId}
                onClick={() => onPageChange(currentPage - 1)}
                label={prevLabel}
              />
            </PaginationItem>

            {/* Numeric Pages */}
            {pages.map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    disabled={disabled}
                    aria-label={`Trang ${page}`}
                    aria-controls={controlsId}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Next Button */}
            <PaginationItem>
              <PaginationNext
                disabled={disabled || currentPage >= totalPages}
                aria-controls={controlsId}
                onClick={() => onPageChange(currentPage + 1)}
                label={nextLabel}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default UserPagination;
