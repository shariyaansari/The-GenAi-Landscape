import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Layers } from "lucide-react";
import type { Tool } from "@/data/tools";

function getTopTrending(tools: Tool[]) {
  if (!Array.isArray(tools) || tools.length === 0) return { name: "N/A", trendScore: 0 };
  return tools.reduce((max, t) => (t.trendScore > max.trendScore ? t : max), tools[0]);
}

function getFastestGrowthCategory(tools: Tool[]) {
  const map = new Map<string, { total: number; count: number }>();

  tools.forEach((tool) => {
    if (!Array.isArray(tool.categories)) return;
    tool.categories.forEach((category) => {
      const entry = map.get(category) || { total: 0, count: 0 };
      entry.total += typeof tool.trendScore === "number" ? tool.trendScore : 0;
      entry.count += 1;
      map.set(category, entry);
    });
  });

  let best = "";
  let bestAvg = -Infinity;

  map.forEach((value, key) => {
    const avg = value.total / value.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      best = key;
    }
  });

  return { category: best || "N/A", avg: Math.round(bestAvg) || 0 };
}

export default function HeroKpis() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/tools")
      .then((res) => res.json())
      .then((data) => {
        const cleaned = Array.isArray(data)
          ? data.map((tool) => ({
              ...tool,
              useCases: Array.isArray(tool.useCases)
                ? tool.useCases
                : typeof tool.useCases === "string"
                ? [tool.useCases]
                : [],
              trendScore: typeof tool.trendScore === "number" ? tool.trendScore : 0,
              categories: Array.isArray(tool.categories) ? tool.categories : [],
            }))
          : [];
        setTools(cleaned);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tools:", err);
        setLoading(false);
      });
  }, []);

  if (loading || tools.length === 0) {
    return (
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Loading KPIs...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Fetching tool data from the server.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const top = getTopTrending(tools);
  const growth = getFastestGrowthCategory(tools);
  const total = tools.length;

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass hover-scale glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Top Trending Tool</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">{top.name}</div>
            <div className="text-xs text-muted-foreground">Trend score</div>
          </div>
          <TrendingUp className="h-6 w-6 text-[hsl(var(--neon))]" />
        </CardContent>
      </Card>

      <Card className="glass hover-scale glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Fastest Growth Category</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">{growth.category}</div>
            <div className="text-xs text-muted-foreground">Avg. score {growth.avg}</div>
          </div>
          <Layers className="h-6 w-6 text-[hsl(var(--neon))]" />
        </CardContent>
      </Card>

      <Card className="glass hover-scale glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Total Tools Tracked</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-2xl font-semibold">{total}</div>
          <Sparkles className="h-6 w-6 text-[hsl(var(--neon))]" />
        </CardContent>
      </Card>

      <Card className="glass hover-scale glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Explore <span className="font-medium">{top.name}</span> and similar tools in{" "}
            {growth.category} for fastest ROI.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}