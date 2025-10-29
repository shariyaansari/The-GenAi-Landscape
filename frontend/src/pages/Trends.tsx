import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import ToolCard from "@/components/ToolCard";
import { tools, categories as toolCategories, pricingModels } from "@/data/tools";
import Chatbot from "@/components/Chatbot";
import { SparklesPreviewColorful } from "@/components/ui/demo";
import SearchFilterBar, { FilterState } from "@/components/SearchFilterBar";

function isEmergingRaw(t: any) {
    const releaseOk = !!t.releaseDate && !isNaN(new Date(t.releaseDate).getTime());
    const monthsSince = releaseOk
        ? (Date.now() - new Date(t.releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
        : Infinity;
    const trendOk = typeof t.trendScore === "number" ? t.trendScore >= 85 : false;
    return monthsSince <= 6 || trendOk;
}

export default function Trends() {
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        category: "all",
        pricing: "all",
    });

    // base emerging list
    const emergingBase = useMemo(() => tools.filter(isEmergingRaw), [tools]);

    // apply UI filters
    const emerging = useMemo(() => {
        const q = (filters.search || "").toLowerCase().trim();
        const selectedCategory = (filters.category || "all").toLowerCase().trim();

        return emergingBase.filter((t) => {
            // search match
            const name = (t.name || "").toLowerCase();
            const desc = (t.description || "").toLowerCase();
            const features = Array.isArray(t.keyFeatures)
                ? t.keyFeatures.join(" ").toLowerCase()
                : "";
            const matchSearch = !q || name.includes(q) || desc.includes(q) || features.includes(q);

            // category match (case-insensitive)
            const matchCategory =
                selectedCategory === "all" ||
                (Array.isArray(t.categories) &&
                    t.categories.some((c: any) => String(c || "").toLowerCase().trim() === selectedCategory));

            // pricing match (case-insensitive)
            const matchPricing =
                !filters.pricing ||
                filters.pricing === "all" ||
                String(t.pricingModel || "").toLowerCase() === String(filters.pricing).toLowerCase();

            return matchSearch && matchCategory && matchPricing;
        });
    }, [emergingBase, filters]);

    return (
        <>
            <Helmet>
                <title>Discover What’s Next in AI</title>
                <meta
                    name="description"
                    content="Explore emerging AI tools and breakthrough technologies shaping the future of AI."
                />
                <link rel="canonical" href="/trends" />
            </Helmet>

            <main className="container mx-auto px-4 py-8 space-y-6 relative">
                <div className="absolute inset-0 w-full h-full">
                    <SparklesPreviewColorful />
                </div>

                <section className="rounded-xl bg-gradient-primary glow p-6 text-center relative z-10">
                    <h1 className="text-3xl font-semibold text-black">Discover what’s next in AI</h1>
                    <p className="text-muted-foreground mt-2">
                        Emerging tools, rising categories, and breakthrough tech.
                    </p>
                </section>

                {/* Search / Filter */}
                <section className="relative z-10">
                    <SearchFilterBar
                        value={filters}
                        onChange={setFilters}
                        categories={["all", ...toolCategories]}
                        pricingOptions={["all", ...pricingModels]}
                    />
                </section>

                <section className="space-y-4 relative z-10">
                    {/* <h2 className="text-xl font-semibold">Emerging & Breakthrough ({emerging.length})</h2> */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {emerging.map((tool, idx) => (
                            <ToolCard key={tool.id ?? `tool-${idx}`} tool={tool} />
                        ))}
                    </div>
                </section>
            </main>

            <Chatbot />
        </>
    );
}
