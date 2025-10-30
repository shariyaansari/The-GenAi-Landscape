import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { tools as allTools, Tool } from "@/data/tools";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import Chatbot from "@/components/Chatbot";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import SpotlightCursor from "../components/spotlight-cursor";
import { SparklesPreviewColorful } from "@/components/ui/demo";

export default function Compare() {
	const { isLoggedIn } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoggedIn) {
			navigate("/login");
		}
	}, [isLoggedIn, navigate]);

	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<Tool[]>([]);

	const filtered = useMemo(
		() =>
			allTools.filter(
				(t) =>
					t.name.toLowerCase().includes(query.toLowerCase()) ||
					t.categories.join(", ").toLowerCase().includes(query.toLowerCase())
			),
		[query]
	);

	const toggle = (tool: Tool) => {
		setSelected((prev) => {
			const exists = prev.find((p) => p.id === tool.id);
			if (exists) return prev.filter((p) => p.id !== tool.id);
			if (prev.length >= 3) return prev; // max 3
			return [...prev, tool];
		});
	};

	// Clear removes a tool from selection
	const clearTool = (id: string) => {
		setSelected((prev) => prev.filter((t) => t.id !== id));
	};

	// Edit replaces a tool (open the search with its name prefilled)
	const editTool = (id: string) => {
		const tool = selected.find((t) => t.id === id);
		if (!tool) return;
		setQuery(tool.name); // prefill search box with tool name
		// optionally also auto-unselect it so user can pick replacement
		setSelected((prev) => prev.filter((t) => t.id !== id));
	};

	return (
		<>
			<Helmet>
				<title>Compare AI Tools</title>
				<meta
					name="description"
					content="Compare AI tools side by side: features, pricing, release dates, and trend scores."
				/>
				<link rel="canonical" href="/compare" />
			</Helmet>

			<main className="container mx-auto px-4 py-10 space-y-8 relative min-h-screen">
				<SpotlightCursor />
				<div className="absolute inset-0 w-full h-full">
					<SparklesPreviewColorful />
				</div>

				{/* <section className="rounded-xl bg-gradient-primary glow p-6 text-center my-10">
          <h1 className="text-3xl font-semibold text-black">Tool Comparator</h1>
          <p className="text-muted-foreground mt-2">Select up to three tools and compare them side by side.</p>
        </section> */}
				<section className="rounded-xl bg-gradient-primary glow p-6 text-center relative z-10 my-[100px]">
					<h1 className="text-3xl font-semibold text-black">
						Tool Comparator
					</h1>
					<p className="text-muted-foreground mt-2">
						Select up to three tools and compare them side by side.
					</p>
				</section>

				<section className="glass rounded-xl p-4">
					<div className="flex flex-col md:flex-row md:items-center gap-3">
						<Input
							placeholder="Search and select up to 3 tools to compare"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="bg-transparent"
						/>	
						<div className="flex flex-wrap gap-2 text-muted-foreground">
							{filtered.slice(0, 6).map((t) => (
								<button
									key={t.id}
									onClick={() => toggle(t)}
									className={`px-3 py-1 rounded-md border	 ${
										selected.find((s) => s.id === t.id)
											? "bg-gradient-primary glow"
											: "hover:bg-grey"
									}`}
								>
									{t.name}
								</button>
							))}
						</div>
					</div>
				</section>

				<section className="glass rounded-xl p-4 overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Attribute</TableHead>
								{selected.map((t) => (
									<TableHead key={t.id} className="relative">
										<div className="flex items-center gap-2">
											<span>{t.name}</span>
											<button
												onClick={() => editTool(t.id)}
												className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-full text-black font-semibold text-sm px-2 py-1 hover:opacity-80 transition"
											>
												Edit
											</button>
											<button
												onClick={() => clearTool(t.id)}
												className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-full text-black font-semibold text-sm px-2 py-1 hover:opacity-80 transition"
											>
												Clear
											</button>
										</div>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell className="font-medium">Category</TableCell>
								{selected.map((t) => (
									<TableCell key={t.id}>{t.categories}</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Pricing</TableCell>
								{selected.map((t) => (
									<TableCell key={t.id} className="capitalize">
										{t.pricingModel}
									</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Release Date</TableCell>
								{selected.map((t) => (
									<TableCell key={t.id}>
										{new Date(t.releaseDate).toLocaleDateString()}
									</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Trend Score</TableCell>
								{selected.map((t) => (
									<TableCell key={t.id}>{t.trendScore}</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Key Features</TableCell>
								{selected.map((t) => (
									<TableCell key={t.id}>
										<ul className="list-disc pl-4">
											{t.keyFeatures.slice(0, 5).map((f) => (
												<li key={f}>{f}</li>
											))}
										</ul>
									</TableCell>
								))}
							</TableRow>
						</TableBody>
					</Table>
				</section>
			</main>
			<Chatbot />
		</>
	);
}
