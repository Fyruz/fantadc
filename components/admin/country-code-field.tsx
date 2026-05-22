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
      <label className="block text-xs font-medium text-[var(--text-secondary)]">
        Nazione
      </label>

      <input type="hidden" name="countryCode" value={value} />
      <Dropdown
        value={value}
        onChange={handleChange}
        options={COUNTRY_OPTIONS}
        optionLabel="label"
        optionValue="value"
        placeholder="Seleziona nazione"
        className="w-full"
        filter
        itemTemplate={(option: CountryOption) => (
          <div className="flex items-center gap-2 py-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={option.flagUrl}
              alt={`${option.label} flag`}
              className="w-5 h-4 object-cover rounded-sm border border-slate-200 flex-shrink-0"
            />
            <span className="text-sm font-medium">{option.label}</span>
            <span className="text-xs text-[var(--text-muted)] ml-auto">
              {option.value}
            </span>
          </div>
        )}
      />

      {selectedCountry ? (
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: "var(--text-muted)" }}>Anteprima:</span>
          {previewBroken ? (
            <Tag value={`${selectedCountry.value} non disponibile`} severity="secondary" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedCountry.flagUrl}
              alt={`Bandiera ${selectedCountry.label}`}
              className="w-6 h-4 object-cover rounded-sm border border-slate-200"
              onError={() => setPreviewBroken(true)}
            />
          )}
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {selectedCountry.label}
          </span>
        </div>
      ) : (
        <Tag value="Nazione non impostata" severity="secondary" />
      )}

      {error ? <p className="text-red-500 text-xs">{error}</p> : null}
    </div>
  );
}
