import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingModelCounts, releasesOverTime, categoryGrowth } from "@/data/tools";

export default function InsightsSection() {
  const pricing = pricingModelCounts();
  const releases = releasesOverTime();
  const growthRaw = categoryGrowth();

  const categories = Array.from(new Set(growthRaw.map((d) => d.category)));
  const months = Array.from(new Set(growthRaw.map((d) => d.month)));
  const growth = months.map((m) => {
    const row: any = { month: m };
    categories.forEach((c) => {
      const found = growthRaw.find((d) => d.month === m && d.category === c);
      row[c] = found ? found.value : 0;
    });
    return row;
  });

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Pricing model distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pricing}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tickLine={false} />
              <YAxis allowDecimals={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Release timeline</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={releases}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tickLine={false} />
              <YAxis allowDecimals={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--neon))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass md:col-span-2">
        <CardHeader>
          <CardTitle>Growth by category</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tickLine={false} />
              <YAxis tickLine={false} />
              <Tooltip />
              <Legend />
              {categories.map((c, i) => (
                <Area
                  key={c}
                  type="monotone"
                  dataKey={c}
                  name={c}
                  stroke={`hsl(var(--pastel-${i % 2 === 0 ? "lavender" : "pink"}))`}
                  fill={`hsl(var(--pastel-${i % 3 === 0 ? "lavender" : i % 3 === 1 ? "mint" : "blue"}))`}
                  fillOpacity={0.35}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
