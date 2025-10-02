export type Tool = {
  id: string;
  name: string;
  description: string;
  keyFeatures: string[];
  categories: string[];
  pricingModel: "free" | "freemium" | "paid" | string;
  popularity: number | null;
  website?: string;
  github?: string | null;
  docs?: string | null;
  useCases?: string[];
  pros?: string[];
  cons?: string[];
  model?: string | null;
  integrations?: string[];
  alternatives?: { id: string; name: string }[];
  releaseDate: string;
  trendScore?: number;
  [key: string]: any;
};

export type Conversation = {
  prompt: string;
  recommendation: string;
  timestamp: string;
};