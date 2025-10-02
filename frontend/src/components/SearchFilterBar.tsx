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

const SearchFilterBar: React.FC<Props> = ({ value, onChange, categories, pricingOptions }) => {
  const [local, setLocal] = useState<FilterState>(value);

  // keep local in sync when parent changes filters (e.g. reset from elsewhere)
  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleApply = () => {
    console.log("Search:", local.search, "Category:", local.category, "Pricing:", local.pricing); // <-- Added log
    onChange(local);
  };

  const handleClear = () => {
    const cleared: FilterState = { search: "", category: "all", pricing: "all" };
    setLocal(cleared);
    onChange(cleared);
  };

  return (
    <div className="w-full rounded-lg p-4 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1">
          <input
            type="search"
            value={local.search}
            onChange={(e) => setLocal({ ...local, search: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Search tools by name or keyword"
            className="w-full rounded-md border px-4 py-3"
            aria-label="Search tools"
          />
        </div>

        <select
          value={local.category}
          onChange={(e) => setLocal({ ...local, category: e.target.value })}
          className="rounded-md border px-4 py-3"
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
          onChange={(e) => setLocal({ ...local, pricing: e.target.value })}
          className="rounded-md border px-4 py-3"
          aria-label="Pricing"
        >
          <option value="all">All pricing</option>
          {pricingOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button onClick={handleClear} className="px-4 py-2 rounded-md border">
            Clear
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-pink-300 to-indigo-300"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
