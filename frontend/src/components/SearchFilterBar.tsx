import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { categories, pricingModels, Category, PricingModel } from "@/data/tools";
import { Search } from "lucide-react";

export type FilterState = {
  search: string;
  category?: Category | "all";
  pricing?: PricingModel | "all";
};

export default function SearchFilterBar({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (v: FilterState) => void;
}) {
  const [local, setLocal] = useState<FilterState>(value);

  useEffect(() => setLocal(value), [value]);

  const apply = (patch: Partial<FilterState>) => {
    const next = { ...local, ...patch } as FilterState;
    setLocal(next);
    onChange(next);
  };

  const clear = () => {
    const base = { search: "", category: "all" as const, pricing: "all" as const };
    setLocal(base);
    onChange(base);
  };

  return (
    <div className="glass rounded-lg p-3 md:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
      <div className="flex-1 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tools by name or keyword"
          value={local.search}
          onChange={(e) => apply({ search: e.target.value })}
          className="bg-transparent"
        />
      </div>
      <Select
        value={local.category ?? "all"}
        onValueChange={(v) => apply({ category: v as any })}
      >
        <SelectTrigger className="w-full md:w-56">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={local.pricing ?? "all"}
        onValueChange={(v) => apply({ pricing: v as any })}
      >
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="Pricing" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All pricing</SelectItem>
          {pricingModels.map((p) => (
            <SelectItem key={p} value={p} className="capitalize">
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="md:ml-auto flex gap-2">
        <Button variant="glass" onClick={clear} className="">
          Clear
        </Button>
        <Button variant="neon">Apply</Button>
      </div>
    </div>
  );
}
