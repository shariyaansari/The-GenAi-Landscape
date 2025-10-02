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
  const [allTools, setAllTools] = useState<Tool[]>([]); // Typed state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    pricing: "all",
  });

  const filtered = useMemo(() => {
    return allTools.filter((t) => {
      const search = (filters.search || "").toLowerCase();

      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        Array.isArray(t.keyFeatures) &&
        t.keyFeatures.some((f) => f.toLowerCase().includes(search));

      const matchCategory =
        !filters.category ||
        filters.category === "all" ||
        (Array.isArray(t.categories) &&
          t.categories.includes(filters.category));

      const matchPricing =
        !filters.pricing ||
        filters.pricing === "all" ||
        t.pricingModel === filters.pricing;

      return matchSearch && matchCategory && matchPricing;
    });
  }, [filters]);

  useEffect(() => {
    let mounted = true;
    const fetchTools = async () => {
      try {
        // Correct URL for default FastAPI server
        const response = await fetch("http://127.0.0.1:8000/api/tools");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Tool[] = await response.json(); // Type the response data
        setAllTools(data);
      } catch (error) {
        console.error("Failed to fetch tools:", error);
      }
    };
    fetchTools();
    return () => {
      mounted = false;
    };
  }, []);
  const latest = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate)
      ),
    [filtered]
  );

  const popular = useMemo(
    () => [...filtered].sort((a, b) => b.popularity - a.popularity),
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
                <ToolCard key={t.id ?? Math.random().toString()} tool={t} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Popular</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popular.slice(0, 6).map((t) => (
                <ToolCard key={t.id ?? Math.random().toString()} tool={t} />
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
