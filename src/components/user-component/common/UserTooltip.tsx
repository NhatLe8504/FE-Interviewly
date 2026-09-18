"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import styles from "./UserTooltip.module.css";

/* -------------------------------------------------------------------------- */
/* Low-level Radix UI Primitives with Glassmorphism User Theme                */
/* -------------------------------------------------------------------------- */

export const UserTooltipProvider = TooltipPrimitive.Provider;
export const UserTooltipRoot = TooltipPrimitive.Root;
export const UserTooltipTrigger = TooltipPrimitive.Trigger;
export const UserTooltipPortal = TooltipPrimitive.Portal;

export interface UserTooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  variant?: "dark" | "warm" | "light";
  arrow?: boolean;
  kbd?: string;
}

export const UserTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  UserTooltipContentProps
>(
  (
    {
      className = "",
      variant = "dark",
      sideOffset = 6,
      arrow = true,
      kbd,
      children,
      ...props
    },
    ref
  ) => {
    const variantClass =
      variant === "warm"
        ? styles.variantWarm
        : variant === "light"
        ? styles.variantLight
        : styles.variantDark;

    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={`${styles.content} ${variantClass} ${className}`.trim()}
          {...props}
        >
          <span>{children}</span>
          {kbd && <span className={styles.kbd}>{kbd}</span>}
          {arrow && (
            <TooltipPrimitive.Arrow
              className={styles.arrow}
              width={10}
              height={5}
            />
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    );
  }
);
UserTooltipContent.displayName = "UserTooltipContent";

/* -------------------------------------------------------------------------- */
/* High-level, ergonomic UserTooltip component for system-wide usage         */
/* -------------------------------------------------------------------------- */

export interface UserTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  delayDuration?: number;
  variant?: "dark" | "warm" | "light";
  kbd?: string;
  disabled?: boolean;
  arrow?: boolean;
  className?: string;
}

export function UserTooltip({
  children,
  content,
  side = "top",
  align = "center",
  sideOffset = 6,
  delayDuration = 180,
  variant = "dark",
  kbd,
  disabled = false,
  arrow = true,
  className = "",
}: UserTooltipProps) {
  // If no tooltip text or explicitly disabled, render children cleanly
  if (!content || disabled) {
    return <>{children}</>;
  }

  // Handle disabled button edge cases (disabled elements don't fire pointer events in browsers)
  const isChildDisabled =
    React.isValidElement(children) && Boolean((children.props as any)?.disabled);

  const triggerNode = isChildDisabled ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "not-allowed",
      }}
      tabIndex={0}
    >
      {children}
    </span>
  ) : React.isValidElement(children) ? (
    children
  ) : (
    <span>{children}</span>
  );

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {triggerNode}
        </TooltipPrimitive.Trigger>
        <UserTooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          variant={variant}
          arrow={arrow}
          kbd={kbd}
          className={className}
        >
          {content}
        </UserTooltipContent>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// Convenient alias for general imports
export { UserTooltip as Tooltip };