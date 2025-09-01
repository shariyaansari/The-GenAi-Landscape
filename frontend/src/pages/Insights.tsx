import { Helmet } from "react-helmet-async";
import InsightsSection from "@/components/InsightsSection";

export default function Insights() {
  return (
    <>
      <Helmet>
        <title>AI Insights & Predictions</title>
        <meta name="description" content="Trending tools, category growth, pricing distributions, and forward-looking insights for the AI landscape." />
        <link rel="canonical" href="/insights" />
      </Helmet>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="rounded-xl bg-gradient-primary glow p-6 text-center">
          <h1 className="text-3xl font-semibold">AI Insights</h1>
          <p className="text-muted-foreground mt-2">Trends, growth by category, and market signals.</p>
        </section>

        <InsightsSection />
      </main>
    </>
  );
}
