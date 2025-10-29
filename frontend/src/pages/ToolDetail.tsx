// import { useParams, Link } from "react-router-dom";
// import { Helmet } from "react-helmet-async";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Calendar, TrendingUp, Globe, Github, BookOpen } from "lucide-react";
// import { useEffect, useState } from "react";
// import Chatbot from "@/components/Chatbot";
// const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// export default function ToolDetail() {
// 	const { id } = useParams();
// 	const [tool, setTool] = useState(null);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState(null);

// 	useEffect(() => {
// 		async function fetchTool() {
// 			try {
// 				const res = await fetch(`${API}/api/tools/${id}`);
// 				if (!res.ok) throw new Error(`HTTP ${res.status}`);
// 				const data = await res.json();
// 				setTool(data);
// 			} catch (err) {
// 				console.error("fetchTool error:", err);
// 				setError(err.message);
// 			} finally {
// 				setLoading(false);
// 			}
// 		}
// 		fetchTool();
// 	}, [id]);

// 	if (loading) return <p>Loading...</p>;
// 	if (error) return <p className="text-red-500">Error: {error}</p>;
// 	if (!tool) {
// 		return (
// 			<main className="container mx-auto px-4 py-12 text-center">
// 				<p>Tool not found.</p>
// 				<Link to="/">
// 					<Button className="mt-4" variant="neon">
// 						Back to dashboard
// 					</Button>
// 				</Link>
// 			</main>
// 		);
// 	}

// 	return (
//         <>
//             <Helmet>
//                 <title>{tool.name} – AI Tool Details</title>
//                 <meta name="description" content={`${tool.name}: ${tool.description}`} />
//                 <link rel="canonical" href={`/tools/${tool.id}`} />
//             </Helmet>
//             <main className="min-h-screen w-full bg-black text-white px-4 py-8 space-y-6">
//                 {/* Header */}
//                 <section className="glass rounded-xl p-6">

//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                         <div>
//                             <h1 className="text-2xl font-semibold">{tool.name}</h1>
//                             <p className="text-muted-foreground mt-2 max-w-2xl">{tool.description}</p>
//                             <div className="mt-3 flex flex-wrap gap-2 items-center">
//                                 {tool.categories?.map((category: string) => (
//                                     <Badge key={category} variant="secondary" className="capitalize">{category}</Badge>
//                                 ))}
//                                 <Badge variant="outline" className="capitalize">{tool.pricingModel}</Badge>
//                                 {tool.releaseDate && (
//                                     <span className="flex items-center gap-1 text-sm text-muted-foreground">
//                                         <Calendar className="h-4 w-4" /> {new Date(tool.releaseDate).toLocaleDateString()}
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
//                                     {tool.keyFeatures.map((f: string) => <li key={f}>{f}</li>)}
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
//                                 <a href={tool.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-neon underline">
//                                     <Globe className="h-4 w-4" /> Website
//                                 </a>
//                             )}
//                             {tool.github && (
//                                 <a href={tool.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-neon underline">
//                                     <Github className="h-4 w-4" /> GitHub
//                                 </a>
//                             )}
//                             {tool.docs && (
//                                 <a href={tool.docs} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-neon underline">
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
//                                     {tool.useCases.map((u: string) => <li key={u}>{u}</li>)}
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
//                                         {tool.pros.map((p: string) => <li key={p}>{p}</li>)}
//                                     </ul>
//                                 </div>
//                             )}
//                             {tool.cons?.length > 0 && (
//                                 <div>
//                                     <h4 className="font-semibold">⚠️ Cons</h4>
//                                     <ul className="list-disc pl-4 text-sm space-y-1">
//                                         {tool.cons.map((c: string) => <li key={c}>{c}</li>)}
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
//                 {/* Navigation Buttons */}
//                 <div className="flex gap-3">
//                     <Link to="/compare">
//                         <Button variant="glass">Compare with others</Button>
//                     </Link>
//                     <Link to="/trends">
//                         <Button>Back to Tools</Button>
//                     </Link>
//                 </div>
//                 <Chatbot />
//             </main>
//         </>
//     );
// }

"use client";
import {
	memo,
	useCallback,
	useEffect,
	useEffect as useReactEffect,
	useRef,
	useState,
} from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Globe, Github, BookOpen } from "lucide-react";
import Chatbot from "@/components/Chatbot";
import { cn } from "@/lib/utils"; // replace with classNames or just join manually if needed
interface GlowingEffectProps {
	blur?: number;
	inactiveZone?: number;
	proximity?: number;
	spread?: number;
	variant?: "default" | "white";
	glow?: boolean;
	className?: string;
	disabled?: boolean;
	movementDuration?: number;
	borderWidth?: number;
}

// ----- GlowingEffect component (inline, not imported) -----
const GlowingEffect = memo(
	({
		blur = 0,
		inactiveZone = 0.7,
		proximity = 0,
		spread = 20,
		variant = "default",
		glow = false,
		className = "",
		movementDuration = 2,
		borderWidth = 1,
		disabled = false,
	}: GlowingEffectProps) => {
		const containerRef = useRef(null);
		const lastPosition = useRef({ x: 0, y: 0 });
		const animationFrameRef = useRef(0);

		const handleMove = useCallback(
			(e) => {
				if (!containerRef.current) return;

				if (animationFrameRef.current) {
					cancelAnimationFrame(animationFrameRef.current);
				}

				animationFrameRef.current = requestAnimationFrame(() => {
					const element = containerRef.current;
					if (!element) return;

					const { left, top, width, height } = element.getBoundingClientRect();
					const mouseX = e?.x ?? lastPosition.current.x;
					const mouseY = e?.y ?? lastPosition.current.y;

					if (e) {
						lastPosition.current = { x: mouseX, y: mouseY };
					}

					const center = [left + width * 0.5, top + height * 0.5];
					const distanceFromCenter = Math.hypot(
						mouseX - center[0],
						mouseY - center[1]
					);
					const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

					if (distanceFromCenter < inactiveRadius) {
						element.style.setProperty("--active", "0");
						return;
					}

					const isActive =
						mouseX > left - proximity &&
						mouseX < left + width + proximity &&
						mouseY > top - proximity &&
						mouseY < top + height + proximity;

					element.style.setProperty("--active", isActive ? "1" : "0");

					if (!isActive) return;

					const currentAngle =
						parseFloat(element.style.getPropertyValue("--start")) || 0;
					let targetAngle =
						(180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
							Math.PI +
						90;

					const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
					const newAngle = currentAngle + angleDiff;

					// Motion one compatibility, simple fallback:
					element.style.setProperty("--start", String(newAngle));
				});
			},
			[inactiveZone, proximity, movementDuration]
		);

		useReactEffect(() => {
			if (disabled) return;

			const handleScroll = () => {
				if (!containerRef.current) return;
				const element = containerRef.current;
				const { left, top, width, height } = element.getBoundingClientRect();
				const centerX = left + width * 0.5;
				const centerY = top + height * 0.5;
				handleMove({ x: centerX, y: centerY });
			};
			const handlePointerMove = (e) => handleMove(e);

			window.addEventListener("scroll", handleScroll, { passive: true });
			document.body.addEventListener("pointermove", handlePointerMove, {
				passive: true,
			});

			return () => {
				if (animationFrameRef.current) {
					cancelAnimationFrame(animationFrameRef.current);
				}
				window.removeEventListener("scroll", handleScroll);
				document.body.removeEventListener("pointermove", handlePointerMove);
			};
		}, [handleMove, disabled]);

		// Tailwind utility fallback for classnames:
		const cx = (...args) => args.filter(Boolean).join(" ");

		return (
			<>
				<div
					className={cn(
						"pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
						glow && "opacity-100",
						variant === "white" && "border-white",
						disabled && "!block"
					)}
				/>
				<div
					ref={containerRef}
					style={
						{
							"--blur": `${blur}px`,
							"--spread": spread,
							"--start": "0",
							"--active": "0",
							"--glowingeffect-border-width": `${borderWidth}px`,
							"--repeating-conic-gradient-times": "5",
							"--gradient":
								variant === "white"
									? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
									: `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
                radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
                radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), 
                radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #dd7bbb 0%,
                  #d79f1e calc(25% / var(--repeating-conic-gradient-times)),
                  #5a922c calc(50% / var(--repeating-conic-gradient-times)), 
                  #4c7894 calc(75% / var(--repeating-conic-gradient-times)),
                  #dd7bbb calc(100% / var(--repeating-conic-gradient-times))
                )`,
						} as React.CSSProperties
					}
					className={cn(
						"pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
						glow && "opacity-100",
						blur > 0 && "blur-[var(--blur)] ",
						className,
						disabled && "!hidden"
					)}
				>
					<div
						className={cn(
							"glow",
							"rounded-[inherit]",
							'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
							"after:[border:var(--glowingeffect-border-width)_solid_transparent]",
							"after:[background:var(--gradient)] after:[background-attachment:fixed]",
							"after:opacity-[var(--active)] after:transition-opacity after:duration-300",
							"after:[mask-clip:padding-box,border-box]",
							"after:[mask-composite:intersect]",
							"after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
						)}
					/>
				</div>
			</>
		);
	}
);
GlowingEffect.displayName = "GlowingEffect";

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
			<main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
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
				<meta
					name="description"
					content={`${tool.name}: ${tool.description}`}
				/>
				<link rel="canonical" href={`/tools/${tool.id}`} />
			</Helmet>
			<main className="min-h-screen w-full bg-black text-white px-4 py-8 space-y-7">
				{/* Header */}
				<section className="relative overflow-visible rounded-xl bg-black/30 backdrop-blur-lg border border-[#64d3fb44] transition-all duration-300 hover:scale-105 p-10">
					<GlowingEffect
						glow
						blur={20}
						spread={38}
						proximity={32}
						movementDuration={1.7}
						borderWidth={2}
						disabled={false}
					/>
					<div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-2xl font-semibold">{tool.name}</h1>
							<p className="text-muted-foreground mt-2 max-w-2xl">
								{tool.description}
							</p>
							<div className="mt-3 flex flex-wrap gap-2 items-center">
								{tool.categories?.map((category) => (
									<Badge
										key={category}
										variant="secondary"
										className="capitalize"
									>
										{category}
									</Badge>
								))}
								<Badge variant="outline" className="capitalize text-white">
									{tool.pricingModel}
								</Badge>
								{tool.releaseDate && (
									<span className="flex items-center gap-1 text-sm text-muted-foreground text-white">
										<Calendar className="h-4 w-4 text-white " />{" "}
										{new Date(tool.releaseDate).toLocaleDateString()}
									</span>
								)}
							</div>
						</div>
						{tool.trendScore !== undefined && (
							<div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[hsl(var(--pastel-blue))]">
								<TrendingUp className="text-[hsl(var(--neon))] text-black" />
								<div>
									<div className="text-sm text-muted-foreground">
										Trend Score
									</div>
									<div className="text-xl font-semibold text-black">
										{tool.trendScore}
									</div>
								</div>
							</div>
						)}
					</div>
				</section>

				{/* Features + Pricing */}
				<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card className="relative overflow-visible rounded-xl bg-black/30 backdrop-blur-lg border border-[#64d3fb44] transition-all duration-300 hover:scale-105 p-10 text-white">
						<GlowingEffect
							glow
							blur={100}
							spread={200}
							proximity={100}
							movementDuration={2}
							borderWidth={3}
							disabled={false}
						/>
						<CardHeader>
							<CardTitle>Key Features</CardTitle>
						</CardHeader>
						<CardContent>
							{tool.keyFeatures && tool.keyFeatures.length > 0 ? (
								<ul className="list-disc pl-5 space-y-2">
									{tool.keyFeatures.map((f) => (
										<li key={f}>{f}</li>
									))}
								</ul>
							) : (
								<p className="text-muted-foreground">No key features listed.</p>
							)}
						</CardContent>
					</Card>
					<Card className="relative overflow-visible rounded-xl bg-black/30 backdrop-blur-lg border border-[#64d3fb44] transition-all duration-300 hover:scale-105 p-10 text-white">
						<GlowingEffect
							glow
							blur={20}
							spread={38}
							proximity={32}
							movementDuration={1.7}
							borderWidth={2}
							disabled={false}
						/>
						<CardHeader>
							<CardTitle>Pricing Model</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="capitalize">{tool.pricingModel}</p>
							<p className="text-sm text-muted-foreground mt-2">
								{/* Contact vendor for details if enterprise or paid. */}
							</p>
						</CardContent>
					</Card>
				</section>

				{/* Official Links */}
				{(tool.website || tool.github || tool.docs) && (
					<Card className="relative overflow-visible rounded-xl bg-black/30 backdrop-blur-lg border border-[#64d3fb44] transition-all duration-300 hover:scale-105 p-10 text-white">
						<GlowingEffect
							glow
							blur={20}
							spread={38}
							proximity={32}
							movementDuration={1.7}
							borderWidth={2}
							disabled={false}
						/>
						<CardHeader>
							<CardTitle>Official Links</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{tool.website && (
								<a
									href={tool.website}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-2 text-neon underline"
								>
									<Globe className="h-4 w-4" /> Website
								</a>
							)}
							{tool.github && (
								<a
									href={tool.github}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-2 text-neon underline"
								>
									<Github className="h-4 w-4" /> GitHub
								</a>
							)}
							{tool.docs && (
								<a
									href={tool.docs}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-2 text-neon underline"
								>
									<BookOpen className="h-4 w-4" /> Documentation
								</a>
							)}
						</CardContent>
					</Card>
				)}

				{/* Use Cases */}
				{tool.useCases && (
					<Card className="relative overflow-visible rounded-xl bg-black/30 backdrop-blur-lg border border-[#64d3fb44] transition-all duration-300 hover:scale-105 p-10 text-white">
						<GlowingEffect
							glow
							blur={20}
							spread={38}
							proximity={32}
							movementDuration={1.7}
							borderWidth={2}
							disabled={false}
						/>
						<CardHeader>
							<CardTitle>Use Cases</CardTitle>
						</CardHeader>
						<CardContent>
							{Array.isArray(tool.useCases) ? (
								<ul className="list-disc pl-5 space-y-1">
									{tool.useCases.map((u) => (
										<li key={u}>{u}</li>
									))}
								</ul>
							) : (
								<p>{tool.useCases}</p>
							)}
						</CardContent>
					</Card>
				)}

				{/* Pros & Cons */}
				{tool.pros?.length || tool.cons?.length ? (
					<Card className="relative overflow-visible rounded-xl bg-black/30 backdrop-blur-lg border border-[#64d3fb44] transition-all duration-300 hover:scale-105 p-10 text-white">
						<GlowingEffect
							glow
							blur={20}
							spread={38}
							proximity={32}
							movementDuration={1.7}
							borderWidth={2}
							disabled={false}
						/>
						<CardHeader>
							<CardTitle>Pros & Cons</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{tool.pros?.length > 0 && (
								<div>
									<h4 className="font-semibold">✅ Pros</h4>
									<ul className="list-disc pl-4 text-sm space-y-1">
										{tool.pros.map((p) => (
											<li key={p}>{p}</li>
										))}
									</ul>
								</div>
							)}
							{tool.cons?.length > 0 && (
								<div>
									<h4 className="font-semibold">⚠️ Cons</h4>
									<ul className="list-disc pl-4 text-sm space-y-1">
										{tool.cons.map((c) => (
											<li key={c}>{c}</li>
										))}
									</ul>
								</div>
							)}
						</CardContent>
					</Card>
				) : null}

				{/* Technical Info */}
				{(tool.model ||
					(tool.integrations && tool.integrations.length > 0)) && (
					<Card className="relative overflow-visible rounded-xl bg-black/30 backdrop-blur-lg border border-[#64d3fb44] transition-all duration-300 hover:scale-105 p-10 text-white">
						<GlowingEffect
							glow
							blur={20}
							spread={38}
							proximity={32}
							movementDuration={1.7}
							borderWidth={2}
							disabled={false}
						/>
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
						<Button variant="glass" className="text-white">
							Compare with others
						</Button>
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
