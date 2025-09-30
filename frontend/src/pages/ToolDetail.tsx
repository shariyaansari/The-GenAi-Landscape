import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
// import { getToolById } from "@/data/tools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Globe, Github, BookOpen } from "lucide-react";
// import { getToolById } from "@/data/tools";
import { useEffect, useState } from "react";
import Chatbot from "@/components/Chatbot";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function ToolDetail() {
	const { id } = useParams();
	const [tool, setTool] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchTool() {
			try {
				const res = await fetch(`${API}/api/tools/${id}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				setTool(data);
			} catch (err) {
				console.error("fetchTool error:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchTool();
	}, [id]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p className="text-red-500">Error: {error}</p>;  
	if (!tool) {
		return (
			<main className="container mx-auto px-4 py-12 text-center">
				<p>Tool not found.</p>
				<Link to="/">
					<Button className="mt-4" variant="neon">
						Back to dashboard
					</Button>
				</Link>
			</main>
		);
	}

	return (
        <>
            <Helmet>
                <title>{tool.name} – AI Tool Details</title>
                <meta name="description" content={`${tool.name}: ${tool.description}`} />
                <link rel="canonical" href={`/tools/${tool.id}`} />
            </Helmet>
            <main className="container mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <section className="glass rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold">{tool.name}</h1>
                            <p className="text-muted-foreground mt-2 max-w-2xl">{tool.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2 items-center">
                                {tool.categories?.map((category: string) => (
                                    <Badge key={category} variant="secondary" className="capitalize">{category}</Badge>
                                ))}
                                <Badge variant="outline" className="capitalize">{tool.pricingModel}</Badge>
                                {tool.releaseDate && (
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" /> {new Date(tool.releaseDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        {tool.trendScore !== undefined && (
                            <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[hsl(var(--pastel-blue))]">
                                <TrendingUp className="text-[hsl(var(--neon))]" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Trend Score</div>
                                    <div className="text-xl font-semibold">{tool.trendScore}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                {/* Features + Pricing */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Key Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tool.keyFeatures && tool.keyFeatures.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2">
                                    {tool.keyFeatures.map((f: string) => <li key={f}>{f}</li>)}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">No key features listed.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Pricing Model</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="capitalize">{tool.pricingModel}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Contact vendor for details if enterprise or paid.
                            </p>
                        </CardContent>
                    </Card>
                </section>
                {/* Official Links */}
                {(tool.website || tool.github || tool.docs) && (
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Official Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {tool.website && (
                                <a href={tool.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-neon underline">
                                    <Globe className="h-4 w-4" /> Website
                                </a>
                            )}
                            {tool.github && (
                                <a href={tool.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-neon underline">
                                    <Github className="h-4 w-4" /> GitHub
                                </a>
                            )}
                            {tool.docs && (
                                <a href={tool.docs} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-neon underline">
                                    <BookOpen className="h-4 w-4" /> Documentation
                                </a>
                            )}
                        </CardContent>
                    </Card>
                )}
                {/* Use Cases */}
                {tool.useCases && (
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Use Cases</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Array.isArray(tool.useCases) ? (
                                <ul className="list-disc pl-5 space-y-1">
                                    {tool.useCases.map((u: string) => <li key={u}>{u}</li>)}
                                </ul>
                            ) : (
                                <p>{tool.useCases}</p>
                            )}
                        </CardContent>
                    </Card>
                )}
                {/* Pros & Cons */}
                {(tool.pros?.length || tool.cons?.length) ? (
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Pros & Cons</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tool.pros?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold">✅ Pros</h4>
                                    <ul className="list-disc pl-4 text-sm space-y-1">
                                        {tool.pros.map((p: string) => <li key={p}>{p}</li>)}
                                    </ul>
                                </div>
                            )}
                            {tool.cons?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold">⚠️ Cons</h4>
                                    <ul className="list-disc pl-4 text-sm space-y-1">
                                        {tool.cons.map((c: string) => <li key={c}>{c}</li>)}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : null}
                {/* Technical Info */}
                {(tool.model || (tool.integrations && tool.integrations.length > 0)) && (
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Technical Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tool.model && (
                                <p>
                                    <strong>Underlying Model:</strong> {tool.model}
                                </p>
                            )}
                            {tool.integrations && tool.integrations.length > 0 && (
                                <p className="mt-2">
                                    <strong>Integrations:</strong> {tool.integrations.join(", ")}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
                {/* Navigation Buttons */}
                <div className="flex gap-3">
                    <Link to="/compare">
                        <Button variant="glass">Compare with others</Button>
                    </Link>
                    <Link to="/trends">
                        <Button>Back to Tools</Button>
                    </Link>
                </div>
                <Chatbot />
            </main>
        </>
    );
}

// import { useParams, Link } from "react-router-dom";
// import { Helmet } from "react-helmet-async";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Calendar, TrendingUp, Globe, Github, BookOpen } from "lucide-react";
// import { getToolById, Tool } from "@/data/tools";

// export default function ToolDetail() {
//     const { id } = useParams();
//     const tool = getToolById(id || "");

//     if (!tool) {
//         return (
//             <main className="container mx-auto px-4 py-12 text-center">
//                 <p>Tool not found.</p>
//                 <Link to="/">
//                     <Button className="mt-4" variant="neon">
//                         Back to dashboard
//                     </Button>
//                 </Link>
//             </main>
//         );
//     }

//     const jsonLd = {
//         "@context": "https://schema.org",
//         "@type": "SoftwareApplication",
//         name: tool.name,
//         applicationCategory: tool.categories?.[0] || "",
//         description: tool.description,
//         offers: {
//             "@type": "Offer",
//             price: tool.pricingModel?.toLowerCase().includes("free") ? 0 : undefined,
//             priceCurrency: "USD",
//             category: tool.pricingModel,
//         },
//         datePublished: tool.releaseDate,
//         aggregateRating: {
//             "@type": "AggregateRating",
//             ratingValue: tool.trendScore ? Math.round(tool.trendScore / 10) : undefined,
//             ratingCount: tool.popularity,
//         },
//     };

//     // Helper for alternatives: since alternatives is an array of string IDs, not objects
//     const getAlternativeBadges = () => {
//         if (!tool.alternatives || tool.alternatives.length === 0) return null;
//         return tool.alternatives.map((altId) => {
//             const altTool = getToolById(altId);
//             if (!altTool) return null;
//             return (
//                 <Link key={altTool.id} to={`/tools/${altTool.id}`}>
//                     <Badge variant="outline" className="cursor-pointer hover:bg-accent">
//                         {altTool.name}
//                     </Badge>
//                 </Link>
//             );
//         });
//     };

//     return (
//         <>
//             <Helmet>
//                 <title>{tool.name} – AI Tool Details</title>
//                 <meta
//                     name="description"
//                     content={`${tool.name}: ${tool.description}`}
//                 />
//                 <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
//                 <link rel="canonical" href={`/tools/${tool.id}`} />
//             </Helmet>

//             <main className="container mx-auto px-4 py-8 space-y-6">
//                 {/* Header */}
//                 <section className="glass rounded-xl p-6">
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                         <div>
//                             <h1 className="text-2xl font-semibold">{tool.name}</h1>
//                             <p className="text-muted-foreground mt-2 max-w-2xl">
//                                 {tool.description}
//                             </p>
//                             <div className="mt-3 flex flex-wrap gap-2 items-center">
//                                 {tool.categories?.map((category) => (
//                                     <Badge key={category} variant="secondary" className="capitalize">
//                                         {category}
//                                     </Badge>
//                                 ))}
//                                 <Badge variant="outline" className="capitalize">
//                                     {tool.pricingModel}
//                                 </Badge>
//                                 {tool.releaseDate && (
//                                     <span className="flex items-center gap-1 text-sm text-muted-foreground">
//                                         <Calendar className="h-4 w-4" />{" "}
//                                         {new Date(tool.releaseDate).toLocaleDateString()}
//                                     </span>
//                                 )}
//                             </div>
//                         </div>
//                         {tool.trendScore !== undefined && (
//                             <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[hsl(var(--pastel-blue))]">
//                                 <TrendingUp className="text-[hsl(var(--neon))]" />
//                                 <div>
//                                     <div className="text-sm text-muted-foreground">Trend Score</div>
//                                     <div className="text-xl font-semibold">{tool.trendScore}</div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </section>

//                 {/* Features + Pricing */}
//                 <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <Card className="glass">
//                         <CardHeader>
//                             <CardTitle>Key Features</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             {tool.keyFeatures && tool.keyFeatures.length > 0 ? (
//                                 <ul className="list-disc pl-5 space-y-2">
//                                     {tool.keyFeatures.map((f) => (
//                                         <li key={f}>{f}</li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <p className="text-muted-foreground">No key features listed.</p>
//                             )}
//                         </CardContent>
//                     </Card>

//                     <Card className="glass">
//                         <CardHeader>
//                             <CardTitle>Pricing Model</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <p className="capitalize">{tool.pricingModel}</p>
//                             <p className="text-sm text-muted-foreground mt-2">
//                                 Contact vendor for details if enterprise or paid.
//                             </p>
//                         </CardContent>
//                     </Card>
//                 </section>

//                 {/* Official Links */}
//                 {(tool.website || tool.github || tool.docs) && (
//                     <Card className="glass">
//                         <CardHeader>
//                             <CardTitle>Official Links</CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-2">
//                             {tool.website && (
//                                 <a
//                                     href={tool.website}
//                                     target="_blank"
//                                     rel="noreferrer"
//                                     className="flex items-center gap-2 text-neon underline"
//                                 >
//                                     <Globe className="h-4 w-4" /> Website
//                                 </a>
//                             )}
//                             {tool.github && (
//                                 <a
//                                     href={tool.github}
//                                     target="_blank"
//                                     rel="noreferrer"
//                                     className="flex items-center gap-2 text-neon underline"
//                                 >
//                                     <Github className="h-4 w-4" /> GitHub
//                                 </a>
//                             )}
//                             {tool.docs && (
//                                 <a
//                                     href={tool.docs}
//                                     target="_blank"
//                                     rel="noreferrer"
//                                     className="flex items-center gap-2 text-neon underline"
//                                 >
//                                     <BookOpen className="h-4 w-4" /> Documentation
//                                 </a>
//                             )}
//                         </CardContent>
//                     </Card>
//                 )}

//                 {/* Use Cases */}
//                 {tool.useCases && (
//                     <Card className="glass">
//                         <CardHeader>
//                             <CardTitle>Use Cases</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             {Array.isArray(tool.useCases) ? (
//                                 <ul className="list-disc pl-5 space-y-1">
//                                     {tool.useCases.map((u) => (
//                                         <li key={u}>{u}</li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <p>{tool.useCases}</p>
//                             )}
//                         </CardContent>
//                     </Card>
//                 )}

//                 {/* Pros & Cons */}
//                 {(tool.pros?.length || tool.cons?.length) ? (
//                     <Card className="glass">
//                         <CardHeader>
//                             <CardTitle>Pros & Cons</CardTitle>
//                         </CardHeader>
//                         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {tool.pros?.length > 0 && (
//                                 <div>
//                                     <h4 className="font-semibold">✅ Pros</h4>
//                                     <ul className="list-disc pl-4 text-sm space-y-1">
//                                         {tool.pros.map((p) => (
//                                             <li key={p}>{p}</li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                             )}
//                             {tool.cons?.length > 0 && (
//                                 <div>
//                                     <h4 className="font-semibold">⚠️ Cons</h4>
//                                     <ul className="list-disc pl-4 text-sm space-y-1">
//                                         {tool.cons.map((c) => (
//                                             <li key={c}>{c}</li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                             )}
//                         </CardContent>
//                     </Card>
//                 ) : null}

//                 {/* Technical Info */}
//                 {(tool.model || (tool.integrations && tool.integrations.length > 0)) && (
//                     <Card className="glass">
//                         <CardHeader>
//                             <CardTitle>Technical Details</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             {tool.model && (
//                                 <p>
//                                     <strong>Underlying Model:</strong> {tool.model}
//                                 </p>
//                             )}
//                             {tool.integrations && tool.integrations.length > 0 && (
//                                 <p className="mt-2">
//                                     <strong>Integrations:</strong> {tool.integrations.join(", ")}
//                                 </p>
//                             )}
//                         </CardContent>
//                     </Card>
//                 )}

//                 {/* Alternatives */}
//                 {tool.alternatives && tool.alternatives.length > 0 && (
//                     <Card className="glass">
//                         <CardHeader>
//                             <CardTitle>Alternatives</CardTitle>
//                         </CardHeader>
//                         <CardContent className="flex flex-wrap gap-2">
//                             {getAlternativeBadges()}
//                         </CardContent>
//                     </Card>
//                 )}

//                 {/* Navigation Buttons */}
//                 <div className="flex gap-3">
//                     <Link to="/compare">
//                         <Button variant="glass">Compare with others</Button>
//                     </Link>
//                     <Link to="/">
//                         <Button variant="neon">Back to Dashboard</Button>
//                     </Link>
//                 </div>
//             </main>
//         </>
//     );
// }