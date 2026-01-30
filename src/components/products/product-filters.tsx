"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ProductFiltersProps {
  categories: FilterOption[];
  roomTypes: FilterOption[];
  styles: FilterOption[];
  selectedCategory?: string;
  selectedRoomType?: string;
  selectedStyle?: string;
  minPrice?: number;
  maxPrice?: number;
  onCategoryChange: (category?: string) => void;
  onRoomTypeChange: (roomType?: string) => void;
  onStyleChange: (style?: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onClearAll: () => void;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value?: string;
  onChange: (value?: string) => void;
}

function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
          value
            ? "border-primary-300 bg-primary-50 text-primary-700"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
        }`}
      >
        <span>{selectedOption?.label || label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 max-h-48 min-w-[140px] overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-soft-md">
            <button
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-neutral-50 ${
                !value ? "font-medium text-primary-600" : "text-neutral-600"
              }`}
            >
              All {label}s
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-neutral-50 ${
                  value === option.value ? "font-medium text-primary-600" : "text-neutral-700"
                }`}
              >
                <span>{option.label}</span>
                {option.count !== undefined && option.count > 0 && (
                  <span className="text-neutral-400">{option.count}</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ProductFilters({
  categories,
  roomTypes,
  styles,
  selectedCategory,
  selectedRoomType,
  selectedStyle,
  minPrice,
  maxPrice,
  onCategoryChange,
  onRoomTypeChange,
  onStyleChange,
  onPriceChange,
  onClearAll,
}: ProductFiltersProps) {
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || "");

  const hasActiveFilters =
    selectedCategory || selectedRoomType || selectedStyle || minPrice !== undefined || maxPrice !== undefined;

  const handleApplyPrice = () => {
    onPriceChange(
      localMinPrice ? Number(localMinPrice) : undefined,
      localMaxPrice ? Number(localMaxPrice) : undefined
    );
    setShowPriceFilter(false);
  };

  const handleClearPrice = () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    onPriceChange(undefined, undefined);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Category"
          options={categories}
          value={selectedCategory}
          onChange={onCategoryChange}
        />
        <FilterDropdown
          label="Room"
          options={roomTypes}
          value={selectedRoomType}
          onChange={onRoomTypeChange}
        />
        <FilterDropdown
          label="Style"
          options={styles}
          value={selectedStyle}
          onChange={onStyleChange}
        />

        {/* Price filter */}
        <div className="relative">
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
              minPrice !== undefined || maxPrice !== undefined
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
            }`}
          >
            <span>
              {minPrice !== undefined || maxPrice !== undefined
                ? `$${minPrice || 0} - $${maxPrice || "∞"}`
                : "Price"}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showPriceFilter ? "rotate-180" : ""}`}
            />
          </button>

          {showPriceFilter && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPriceFilter(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-neutral-200 bg-white p-3 shadow-soft-md">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] text-neutral-500">Min</label>
                    <input
                      type="number"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-full rounded border border-neutral-200 px-2 py-1 text-xs outline-none focus:border-primary-400"
                    />
                  </div>
                  <span className="mt-4 text-neutral-400">-</span>
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] text-neutral-500">Max</label>
                    <input
                      type="number"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                      placeholder="∞"
                      className="w-full rounded border border-neutral-200 px-2 py-1 text-xs outline-none focus:border-primary-400"
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleClearPrice}
                    className="flex-1 rounded border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleApplyPrice}
                    className="flex-1 rounded bg-primary-500 px-2 py-1 text-xs text-white hover:bg-primary-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedCategory && (
            <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] text-primary-700">
              {selectedCategory}
              <button onClick={() => onCategoryChange(undefined)} className="hover:text-primary-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedRoomType && (
            <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] text-primary-700">
              {selectedRoomType}
              <button onClick={() => onRoomTypeChange(undefined)} className="hover:text-primary-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedStyle && (
            <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] text-primary-700">
              {selectedStyle}
              <button onClick={() => onStyleChange(undefined)} className="hover:text-primary-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] text-primary-700">
              ${minPrice || 0} - ${maxPrice || "∞"}
              <button onClick={handleClearPrice} className="hover:text-primary-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={onClearAll}
            className="text-[10px] text-neutral-500 hover:text-neutral-700"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
