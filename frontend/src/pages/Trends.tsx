import { Helmet } from "react-helmet-async";
import ToolCard from "@/components/ToolCard";
import { tools } from "@/data/tools"; 

function isEmerging(t: any) {
  const monthsSince =
    (Date.now() - new Date(t.releaseDate).getTime()) /
    (1000 * 60 * 60 * 24 * 30);

  return monthsSince <= 6 || t.trendScore >= 85;
}

export default function Trends() {
  const emerging = tools
    .filter(isEmerging)
    .sort((a, b) => b.trendScore - a.trendScore);

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

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="rounded-xl bg-gradient-primary glow p-6 text-center">
          <h1 className="text-3xl font-semibold">Discover what’s next in AI</h1>
          <p className="text-muted-foreground mt-2">
            Emerging tools, rising categories, and breakthrough tech.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Emerging & Breakthrough</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emerging.map((t) => (
              <ToolCard key={t.id} tool={t} /> 
              ))
            }
          </div>
        </section>
      </main>
    </>
  );
}
