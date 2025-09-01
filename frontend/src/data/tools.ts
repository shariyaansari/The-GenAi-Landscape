import toolsData from "./tools.json";

export type Tool = {
  id: string;
  name: string;
  description: string;
  categories: string[];
  pricingModel: string | null;
  popularity: number | null;
  website?: string;
  github?: string | null;
  docs?: string | null;
  keyFeatures?: string[];
  useCases?: string[] | string;
  pros?: string[];
  cons?: string[];
  model?: string | null;
  integrations?: string[];
  alternatives?: string[]; // <-- updated to match JSON
  releaseDate: string;
  trendScore: number;
  logoUrl:string,
};

interface ToolCardProps {
  tool: Tool;
}

// const ToolCard = ({ tool }: ToolCardProps) => {
//   return (
//     <div>
//       <h3>{tool.name}</h3>
//       <p>{tool.description}</p>
//     </div>
//   );
// };

// export default ToolCard;

export const tools: Tool[] = toolsData as Tool[];

export const categories = [
  "AI",
  "Productivity",
  "Marketing",
  "Design",
  "Education",
] as const;

export function pricingModelCounts() {
  const counts: Record<string, number> = {};
  tools.forEach((tool) => {
    const model = tool.pricingModel || "unknown";
    counts[model] = (counts[model] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function releasesOverTime() {
  const counts: Record<string, number> = {};
  tools.forEach((tool) => {
    if (!tool.releaseDate) return;
    const month = tool.releaseDate.slice(0, 7); // "YYYY-MM"
    counts[month] = (counts[month] || 0) + 1;
  });
  return Object.entries(counts).map(([month, count]) => ({ month, count }));
}

export function categoryGrowth() {
  const data: { month: string; category: string; value: number }[] = [];
  const counts: Record<string, Record<string, number>> = {};

  tools.forEach((tool) => {
    if (!tool.releaseDate || !tool.categories) return;
    const month = tool.releaseDate.slice(0, 7); // "YYYY-MM"
    tool.categories.forEach((category: string) => {
      if (!counts[month]) counts[month] = {};
      counts[month][category] = (counts[month][category] || 0) + 1;
    });
  });

  Object.entries(counts).forEach(([month, catCounts]) => {
    Object.entries(catCounts).forEach(([category, value]) => {
      data.push({ month, category, value });
    });
  });

  return data;
}

export const pricingModels = ["free", "freemium", "paid"] as const;

export type Category = (typeof categories)[number];
export type PricingModel = (typeof pricingModels)[number];

export function getToolById(id: string) {
  return tools.find((tool) => tool.id === id);
}