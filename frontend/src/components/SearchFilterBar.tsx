import React, { useEffect, useState } from "react";

export type FilterState = {
  search: string;
  category: string;
  pricing: string;
};

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  categories: string[];
  pricingOptions: string[];
};

const SearchFilterBar: React.FC<Props> = ({
  value,
  onChange,
  categories,
  pricingOptions,
}) => {
  const [local, setLocal] = useState<FilterState>(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleApply = () => {
    onChange(local);
  };

  const handleClear = () => {
    const cleared: FilterState = { search: "", category: "all", pricing: "all" };
    setLocal(cleared);
    onChange(cleared);
  };

  return (
    <div className="glow-search-wrapper w-full mx-auto my-8 max-w-4xl">
      <div className="glow-search-bg"></div>
      <div
        className="
          glass transition-all relative z-10 px-5 py-4 
          rounded-2xl shadow-lg flex flex-col sm:flex-row gap-3 items-center
        "
      >
        {/* SEARCH INPUT */}
        <div className="flex-1 w-full">
          <input
            type="search"
            value={local.search}
            onChange={(e) => setLocal({ ...local, search: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Search tools by name or keyword"
            className="
              w-full rounded-lg px-4 py-3 bg-black/40 text-white font-medium text-base 
              border-0 outline-none transition shadow
              focus:ring-2 focus:ring-pink-300 focus:bg-black/50
              placeholder:text-gray-400"
            aria-label="Search tools"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <select
          value={local.category}
          onChange={(e) => {
            const next = { ...local, category: e.target.value };
            setLocal(next);
            onChange(next); // immediate apply for category
          }}
          className="rounded-lg px-4 py-3 bg-black/30 text-white border-0 hover:bg-black/40 focus:ring-2 focus:ring-purple-200"
          aria-label="Category"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={local.pricing}
          onChange={(e) => {
            const next = { ...local, pricing: e.target.value };
            setLocal(next);
            onChange(next); // immediate apply for pricing
          }}
          className="rounded-lg px-4 py-3 bg-black/30 text-white border-0 hover:bg-black/40 focus:ring-2 focus:ring-purple-200"
          aria-label="Pricing"
        >
          <option value="all">All pricing</option>
          {pricingOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-lg border border-white/20 shadow text-white bg-black/40 hover:bg-black/60 transition"
            type="button"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-pink-400 to-indigo-400 shadow-md text-white hover:from-pink-500 hover:to-indigo-600 transition"
            type="button"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;