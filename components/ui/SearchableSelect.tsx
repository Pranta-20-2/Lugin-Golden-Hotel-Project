"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/icons";

export type SearchableSelectOption = {
  value: string;
  label: string;
  searchText?: string;
};

type SearchableSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
};

const triggerClass =
  "flex h-11 w-full items-center justify-between rounded-xl border-0 bg-slate-50 px-4 text-left text-sm text-slate-800 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

export default function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  required = false,
  disabled = false,
  emptyMessage = "No matches found",
  className = "",
}: SearchableSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let list = options;

    if (normalizedQuery) {
      list = options.filter((option) => {
        const text = (option.searchText ?? option.label).toLowerCase();
        return text.includes(normalizedQuery);
      });
    }

    if (value && selectedOption && list.some((option) => option.value === value)) {
      return [
        selectedOption,
        ...list.filter((option) => option.value !== value),
      ];
    }

    return list;
  }, [options, query, selectedOption, value]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          value={value}
          required
          onChange={() => undefined}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      )}

      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
        className={triggerClass}
      >
        <span className={selectedOption ? "text-slate-800" : "text-slate-400"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="text-slate-400" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border-0 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <ul
            role="listbox"
            aria-labelledby={id}
            className="max-h-56 overflow-y-auto py-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">{emptyMessage}</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                        isSelected
                          ? "bg-blue-50 font-semibold text-primary"
                          : "text-slate-800"
                      }`}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
