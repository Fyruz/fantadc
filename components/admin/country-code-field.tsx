"use client";

import { useMemo, useState } from "react";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { COUNTRY_OPTIONS, type CountryOption } from "@/lib/flags";

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function CountryCodeField({ value, onChange, error }: Props) {
  const [previewBroken, setPreviewBroken] = useState(false);
  const inputId = "countryCode";

  const selectedCountry = useMemo(
    () => COUNTRY_OPTIONS.find((option) => option.value === value) ?? null,
    [value]
  );

  const handleChange = (event: DropdownChangeEvent) => {
    const next = typeof event.value === "string" ? event.value : "";
    setPreviewBroken(false);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
        Nazione
      </label>

      <input type="hidden" name="countryCode" value={value} />
      <Dropdown
        inputId={inputId}
        value={value}
        onChange={handleChange}
        options={COUNTRY_OPTIONS}
        optionLabel="label"
        optionValue="value"
        placeholder="Seleziona nazione"
        className="w-full"
        filter
        valueTemplate={(option: CountryOption | undefined, props) => {
          if (!option) return <span>{props.placeholder}</span>;
          return (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={option.flagUrl}
                alt={`${option.label} flag`}
                className="w-5 h-4 object-contain rounded-sm border border-slate-200 bg-white"
              />
              <span className="truncate">{option.label}</span>
              <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                {option.value}
              </span>
            </div>
          );
        }}
        itemTemplate={(option: CountryOption) => (
          <div className="flex items-center gap-2 py-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={option.flagUrl}
              alt={`${option.label} flag`}
              className="w-5 h-4 object-contain rounded-sm border border-slate-200 bg-white flex-shrink-0"
            />
            <span className="text-sm font-medium">{option.label}</span>
            <span className="text-xs text-[var(--text-muted)] ml-auto">
              {option.value}
            </span>
          </div>
        )}
      />

      <div
        className="rounded-xl px-3 py-2.5 flex items-center gap-2"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border-soft)" }}
      >
        {selectedCountry ? (
          <>
            {previewBroken ? (
              <Tag value={`${selectedCountry.value} non disponibile`} severity="secondary" className="!text-[10px] !font-bold" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedCountry.flagUrl}
                alt={`Bandiera ${selectedCountry.label}`}
                className="w-6 h-4 object-contain rounded-sm border border-slate-200 bg-white"
                onError={() => setPreviewBroken(true)}
              />
            )}
            <span className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {selectedCountry.label}
            </span>
            <span className="text-[10px] font-black ml-auto" style={{ color: "var(--text-muted)" }}>
              {selectedCountry.value}
            </span>
          </>
        ) : (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Nazione non impostata
          </span>
        )}
      </div>

      {error ? <p className="text-red-500 text-xs">{error}</p> : null}
    </div>
  );
}
