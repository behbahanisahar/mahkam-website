"use client";

import { useEffect, useId, useMemo, useRef, useState, Fragment } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectGroup = {
  label: string;
  options: SelectOption[];
};

type Props = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
};

function flatten(options: SelectOption[], groups: SelectGroup[]) {
  if (groups.length > 0) {
    return groups.flatMap((g) => g.options);
  }
  return options;
}

export function Select({
  value,
  defaultValue = "",
  onChange,
  options = [],
  groups = [],
  placeholder = "انتخاب کنید",
  disabled = false,
  className,
  name,
  id,
  "aria-label": ariaLabel,
}: Props) {
  const generatedId = useId();
  const listId = `${generatedId}-list`;
  const triggerId = id ?? `${generatedId}-trigger`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = value ?? uncontrolled;
  const items = useMemo(() => flatten(options, groups), [options, groups]);
  const selectedLabel = items.find((o) => o.value === selected)?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: string) {
    if (value === undefined) setUncontrolled(next);
    onChange?.(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      {name ? <input type="hidden" name={name} value={selected} /> : null}
      <button
        type="button"
        id={triggerId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-glass-border bg-white py-2.5 pr-3 pl-3 text-start text-sm outline-none transition",
          "focus:border-copper focus:ring-2 focus:ring-copper/20",
          disabled && "cursor-not-allowed opacity-70",
          !selected && "text-muted",
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted transition", open && "rotate-180")}
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={triggerId}
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-glass-border bg-white py-1 shadow-lg shadow-ink/10"
        >
          {options.length > 0
            ? options.map((opt) => (
                <SelectItem
                  key={opt.value || "__empty"}
                  option={opt}
                  selected={opt.value === selected}
                  onSelect={choose}
                />
              ))
            : null}
          {groups.map((group) => (
            <Fragment key={group.label || group.options[0]?.value || "group"}>
              {group.label ? (
                <li role="presentation">
                  <div className="px-3 pb-1 pt-2 text-[11px] font-bold text-muted">{group.label}</div>
                </li>
              ) : null}
              {group.options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  option={opt}
                  selected={opt.value === selected}
                  onSelect={choose}
                />
              ))}
            </Fragment>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SelectItem({
  option,
  selected,
  onSelect,
}: {
  option: SelectOption;
  selected: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <li role="none">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(option.value)}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm transition hover:bg-copper/8",
          selected && "bg-copper/10 font-semibold text-copper-deep",
        )}
      >
        <span className="truncate">{option.label}</span>
        {selected ? <Check className="size-3.5 shrink-0 text-copper" /> : null}
      </button>
    </li>
  );
}
