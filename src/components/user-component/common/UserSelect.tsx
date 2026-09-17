"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { ChevronDown, Check, ChevronUp } from "lucide-react";
import styles from "./UserSelect.module.css";

/* -------------------------------------------------------------------------- */
/* Low-level Radix UI Primitives with Glassmorphism User Theme                */
/* -------------------------------------------------------------------------- */

export const UserSelect = SelectPrimitive.Root;
export const UserSelectGroup = SelectPrimitive.Group;
export const UserSelectValue = SelectPrimitive.Value;

export function UserSelectTrigger({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={`${styles.trigger} ${className}`}
      {...props}
    >
      <span className={styles.value}>{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={15} className={styles.icon} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function UserSelectContent({
  className = "",
  children,
  position = "popper",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  React.useEffect(() => {
    // Radix UI Select automatically injects data-scroll-locked on body,
    // which hides all page/layout scrollbars and shifts the entire viewport.
    // Clean it up immediately on mount and during dropdown lifetime.
    const unlockScroll = () => {
      if (typeof document !== "undefined" && document.body) {
        if (document.body.hasAttribute("data-scroll-locked")) {
          document.body.removeAttribute("data-scroll-locked");
        }
        if (document.body.style.overflow === "hidden") {
          document.body.style.overflow = "";
        }
        if (document.body.style.marginRight) {
          document.body.style.marginRight = "";
        }
      }
    };

    unlockScroll();
    const timer = setTimeout(unlockScroll, 10);
    const interval = setInterval(unlockScroll, 40);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      unlockScroll();
    };
  }, []);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={sideOffset}
        className={`${styles.content} ${className}`}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className={styles.scrollBtn}>
          <ChevronUp size={14} />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className={styles.viewport}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className={styles.scrollBtn}>
          <ChevronDown size={14} />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function UserSelectItem({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={`${styles.item} ${className}`}
      {...props}
    >
      <SelectPrimitive.ItemText>
        <span className={styles.itemText}>{children}</span>
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
        <Check size={14} strokeWidth={2.5} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

/* -------------------------------------------------------------------------- */
/* High-level All-in-one SimpleUserSelect Component                           */
/* -------------------------------------------------------------------------- */

export interface UserSelectOption {
  value: string;
  label: React.ReactNode;
}

export interface SimpleUserSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: UserSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function SimpleUserSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
}: SimpleUserSelectProps) {
  const selectedLabel = React.useMemo(() => {
    const found = options.find((opt) => opt.value === value);
    return found ? found.label : placeholder;
  }, [options, value, placeholder]);

  return (
    <UserSelect
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <UserSelectTrigger
        id={id}
        className={className}
        aria-label={ariaLabel}
      >
        <UserSelectValue placeholder={placeholder}>
          {selectedLabel}
        </UserSelectValue>
      </UserSelectTrigger>
      <UserSelectContent>
        {options.map((option) => (
          <UserSelectItem key={option.value} value={option.value}>
            {option.label}
          </UserSelectItem>
        ))}
      </UserSelectContent>
    </UserSelect>
  );
}

export default SimpleUserSelect;