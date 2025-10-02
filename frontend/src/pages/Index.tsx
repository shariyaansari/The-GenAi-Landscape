import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import ToolCard from "@/components/ToolCard";
import SearchFilterBar, { FilterState } from "@/components/SearchFilterBar";
import InsightsSection from "@/components/InsightsSection";
import HeroKpis from "@/components/HeroKpis";
import toolsJson from "@/data/tools.json"; // fallback
import Chatbot from "@/components/Chatbot";
import { Tool } from "@/types";

const normalize = (s?: any) =>
  (s ?? "").toString().toLowerCase().trim();

const detectPricingCategory = (raw?: string) => {
  const p = normalize(raw);
  if (!p) return "unknown";
  if (p.includes("freemium")) return "freemium";
  // exact free but not freemium
  if (p.includes("free") && !p.includes("freemium")) return "free";
  // numeric price, currency symbols, monthly/subscription words -> paid
  if (
    /\$\d+|\d+\s?inr|\d+\s?₹|\d+\/month|\bmonthly\b|\bsubscription\b|\bpaid\b|\bhandler:price\b|\bper month\b/.test(
      p
    ) ||
    p.match(/\d/)
  )
    return "paid";
  // fallback: if it contains 'trial' + 'free' treat as freemium-ish
  if (p.includes("trial") && p.includes("free")) return "freemium";
  // fallback to checking keywords
  if (p.includes("paid")) return "paid";
  return p; // unknown token
};

const Index = () => {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    pricing: "all",
  });

  // Fetch with fallback to local JSON
  useEffect(() => {
    let mounted = true;
    const fetchTools = async () => {
      try {
        const resp = await fetch("http://127.0.0.1:8000/api/tools");
        if (!resp.ok) throw new Error("bad response");
        const data: Tool[] = await resp.json();
        if (mounted) setAllTools(data);
      } catch (err) {
        console.warn("API fetch failed, using local JSON:", err);
        if (mounted) setAllTools((toolsJson as unknown) as Tool[]);
      }
    };
    fetchTools();
    return () => {
      mounted = false;
    };
  }, []);

  // derive available categories from data (normalized)
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allTools.forEach((t) => {
      // categories array
      if (Array.isArray(t.categories)) {
        t.categories.forEach((c) => set.add(normalize(c)));
      }
      // single category string
      if (t.categories && typeof t.categories === "string") {
        normalize(t.categories)
          .split(/[,\|\/]/)
          .map((s) => s.trim())
          .forEach((c) => c && set.add(c));
      }
      // tags / keyFeatures may also be useful
      if (Array.isArray((t as any).tags)) {
        (t as any).tags.forEach((c: any) => set.add(normalize(c)));
      }
      if (Array.isArray(t.keyFeatures)) {
        t.keyFeatures.forEach((k) => set.add(normalize(k)));
      }
    });
    const arr = [...set].filter(Boolean);
    // sort alphabetically and return
    return arr.sort((a, b) => a.localeCompare(b));
  }, [allTools]);

  // pricing options (static, but could be derived similarly)
  const pricingOptions = useMemo(() => ["all", "free", "freemium", "paid"], []);

  // robust filter: search + category + pricing (handles varied shapes)
  const filtered = useMemo(() => {
    const selCategory = normalize(filters.category);
    const selSearch = normalize(filters.search);
    const selPricing = normalize(filters.pricing);

    return allTools.filter((t) => {
      // search match
      const name = normalize(t.name);
      const desc = normalize(t.description);
      const keyFeatures = Array.isArray(t.keyFeatures)
        ? t.keyFeatures.map(normalize).join(" ")
        : "";
      const searchMatch =
        !selSearch ||
        name.includes(selSearch) ||
        desc.includes(selSearch) ||
        keyFeatures.includes(selSearch);

      // category match (partial & case-insensitive)
      let categoryCandidates: string[] = [];
      if (Array.isArray(t.categories)) {
        categoryCandidates.push(...t.categories.map(normalize));
      }
      if (t.categories && typeof t.categories === "string") {
        categoryCandidates.push(
          ...normalize(t.categories).split(/[,\|\/]/).map((s) => s.trim())
        );
      }
      if (Array.isArray((t as any).tags)) {
        categoryCandidates.push(...(t as any).tags.map(normalize));
      }
      if (Array.isArray(t.keyFeatures)) {
        categoryCandidates.push(...t.keyFeatures.map(normalize));
      }
      if (t.description) categoryCandidates.push(normalize(t.description));

      const categoryMatch =
        selCategory === "all" ||
        (!selCategory && true) ||
        categoryCandidates.some((c) => c && c.includes(selCategory));

      // pricing match: detect price category from any possible field
      const rawPricing =
        normalize((t as any).pricingModel) ||
        normalize((t as any).pricing) ||
        normalize((t as any).pricing_model) ||
        normalize((t as any).price) ||
        "";
      const toolPricingCategory = detectPricingCategory(rawPricing);

      console.log("Tool:", t.name, "RawPricing:", rawPricing, "DetectedCategory:", toolPricingCategory, "SelectedPricing:", selPricing);

      const pricingMatch =
        selPricing === "all" ||
        (selPricing && toolPricingCategory === selPricing) ||
        (selPricing === "freemium" &&
          rawPricing.includes("trial") &&
          rawPricing.includes("free"));

      return searchMatch && categoryMatch && pricingMatch;
    });
  }, [allTools, filters]);

  // derived Latest and Popular lists
  const latest = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          +new Date(b.releaseDate ? b.releaseDate : 0) -
          +new Date(a.releaseDate ? a.releaseDate : 0)
      ),
    [filtered]
  );

  const popular = useMemo(
    () =>
      [...filtered].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)),
    [filtered]
  );

  return (
    <>
      <Helmet>
        <title>Generative AI Landscape Dashboard</title>
        <meta
          name="description"
          content="Explore the latest and most popular AI tools, compare features and pricing, and see trends in the Generative AI landscape."
        />
        <link rel="canonical" href="/" />
      </Helmet>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <HeroKpis />

        <SearchFilterBar
          value={filters}
          onChange={setFilters}
          // pass dynamic categories (normalized strings)
          categories={availableCategories}
          pricingOptions={pricingOptions}
        />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Latest</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latest.slice(0, 6).map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Popular</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popular.slice(0, 6).map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Insights & Trends</h2>
          <InsightsSection />
        </section>
      </main>

      <Chatbot />
    </>
  );
};

export default Index;
