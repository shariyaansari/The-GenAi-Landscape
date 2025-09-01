import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ToolCard({ tool }) {
  return (
    <Link to={`/tools/${tool.id}`}>
      <Card className="glass hover:shadow-lg transition">
        <CardHeader className="flex items-center gap-3">
          {/* ✅ Tool Logo */}
          {tool.logoUrl && (
            <img
              src={tool.logoUrl}
              alt={tool.name}
              className="w-10 h-10 rounded-md object-contain"
            />
          )}
          <CardTitle className="text-lg">{tool.name}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tool.description}
          </p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Badge variant="secondary">{tool.categories}</Badge>
            <Badge variant="outline">{tool.pricingModel}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
