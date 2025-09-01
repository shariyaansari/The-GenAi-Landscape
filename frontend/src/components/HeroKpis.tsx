import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Layers } from "lucide-react";
import { tools } from "@/data/tools";

function getTopTrending() {
  return tools.reduce((max, t) => (t.trendScore > max.trendScore ? t : max), tools[0]);
}

function getFastestGrowthCategory() {
  const map = new Map<string, { total: number; count: number }>();
  tools.forEach((t) => {
    const entry = map.get(t.category) || { total: 0, count: 0 };
    entry.total += t.trendScore;
    entry.count += 1;
    map.set(t.category, entry);
  });
  let best = "";
  let bestAvg = -Infinity;
  map.forEach((v, k) => {
    const avg = v.total / v.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      best = k;
    }
  });
  return { category: best, avg: Math.round(bestAvg) };
}

export default function HeroKpis() {
  const top = getTopTrending();
  const growth = getFastestGrowthCategory();
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
          <p className="text-sm">Explore <span className="font-medium">{top.name}</span> and similar tools in {growth.category} for fastest ROI.</p>
        </CardContent>
      </Card>
    </section>
  );
}
