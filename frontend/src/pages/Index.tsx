import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import ToolCard from "@/components/ToolCard";
import SearchFilterBar, { FilterState } from "@/components/SearchFilterBar";
import InsightsSection from "@/components/InsightsSection";
import HeroKpis from "@/components/HeroKpis";
import Chatbot from "@/components/Chatbot"; // Import the Chatbot
import { Tool } from "@/types";


const Index = () => {
  // renamed state to avoid shadowing an import
  const [tools, setTools] = useState<Tool[]>([]); // Typed state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    pricing: "all",
  });

  const filtered = useMemo(() => {
    const search = (filters.search || "").toLowerCase();

    return tools.filter((t) => {
      const name = (t.name || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      const keyFeatures = Array.isArray(t.keyFeatures)
        ? t.keyFeatures.map((f) => (f || "").toLowerCase())
        : [];

      const matchSearch =
        !search ||
        name.includes(search) ||
        desc.includes(search) ||
        keyFeatures.some((f) => f.includes(search));

      const matchCategory =
        !filters.category ||
        filters.category === "all" ||
        (Array.isArray(t.categories) && t.categories.includes(filters.category));

      const matchPricing =
        !filters.pricing ||
        filters.pricing === "all" ||
        String(t.pricingModel) === filters.pricing;

      return matchSearch && matchCategory && matchPricing;
    });
  }, [tools, filters]); // include tools so memo updates after fetch

  useEffect(() => {
    const fetchTools = async () => {
      try {
        // Correct URL for default FastAPI server
        const response = await fetch("http://127.0.0.1:8000/api/tools");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Tool[] = await response.json(); // Type the response data
        setTools(data);
      } catch (error) {
        console.error("Failed to fetch tools:", error);
      }
    };
    fetchTools();
  }, []);

  const latest = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          (+new Date(b.releaseDate || 0) || 0) - (+new Date(a.releaseDate || 0) || 0)
      ),
    [filtered]
  );

  const popular = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
      ),
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

        <SearchFilterBar value={filters} onChange={setFilters} />

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
      <Chatbot /> {/* Render the Chatbot component */}
    </>
  );
};

export default Index;
