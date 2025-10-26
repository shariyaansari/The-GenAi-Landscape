import { Helmet } from "react-helmet-async";
import { SparklesPreviewColorful } from "@/components/ui/demo";
import { useNavigate } from "react-router-dom"; // For React Router
import SpotlightCursor from "../components/spotlight-cursor";
import { tools } from "@/data/tools";
import ToolCarousel from "@/components/ToolCarousel";

const Index = () => {
	const navigate = useNavigate();

	// Sort by most recent release date
	const latestTools = [...tools]
		.filter((tool) => !!tool.releaseDate)
		.sort(
			(a, b) =>
				new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
		)
		.slice(0, 10);

	// Sort by highest trendScore
	const trendingTools = [...tools]
		.sort((a, b) => (b.trendScore ?? 0) - (a.trendScore ?? 0))
		.slice(0, 10);

	return (
		<>
			<Helmet>
				<title>Gen AI Landscape</title>
				<meta
					name="description"
					content="Discover the future of AI by exploring top tools."
				/>
				<link rel="canonical" href="/" />
			</Helmet>
			<main className="relative min-h-screen w-full bg-black overflow-hidden">
				<SpotlightCursor />
				{/* Full-page sparkles background */}
				<div className="absolute inset-0 w-full h-full">
					<SparklesPreviewColorful />
				</div>

				{/* --- HERO --- */}
				<section className="relative z-10 flex flex-col justify-center items-center text-center min-h-[70vh] px-4">
					<h1 className="font-bold text-white text-3xl md:text-5xl lg:text-6xl mb-6">
						Want to discover AI tools?
					</h1>
					<button
						className="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-xl shadow-lg hover:scale-105 focus:outline-none transition-all"
						onClick={() => navigate("/trends")}
					>
						Discover
					</button>
				</section>

				{/* --- CAROUSELS, stacked below hero --- */}
				<section className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-24 space-y-16 text-white align-middle">
					<ToolCarousel
						title="Discover Latest Tools in Various Categories"
						tools={latestTools}
					/>
					<ToolCarousel title="Discover Trending Tools" tools={trendingTools} />
				</section>
			</main>
		</>
	);
};

export default Index;

// import { Helmet } from "react-helmet-async";
// import { SparklesPreviewColorful } from "@/components/ui/demo";
// import { useNavigate } from "react-router-dom";
// import SpotlightCursor from "@/components/spotlight-cursor";
// import ToolCarousel from "@/components/ToolCarousel";
// import { tools } from "@/data/tools"; // Array of tool objects, each with trendScore, releaseDate, etc.

// const Index = () => {
// 	const navigate = useNavigate();

// 	// Sort by most recent release date
// 	const latestTools = [...tools]
// 		.filter((tool) => !!tool.releaseDate)
// 		.sort(
// 			(a, b) =>
// 				new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
// 		)
// 		.slice(0, 10);

// 	// Sort by highest trendScore
// 	const trendingTools = [...tools]
// 		.sort((a, b) => (b.trendScore ?? 0) - (a.trendScore ?? 0))
// 		.slice(0, 10);

// 	return (
// 		<>
// 			<Helmet>
// 				<title>Gen AI Landscape</title>
// 				<meta
// 					name="description"
// 					content="Discover the future of AI by exploring top tools."
// 				/>
// 				<link rel="canonical" href="/" />
// 			</Helmet>
// 			<main className="relative min-h-screen w-full bg-black text-white overflow-x-hidden">
// 				<div className="absolute inset-0 -z-20">
// 					<SparklesPreviewColorful />
// 				</div>
// 				<SpotlightCursor />
// 				{/* HERO */}
// 				<section className="flex flex-col justify-center items-center text-center px-4 pt-32 pb-12">
// 					<h1 className="font-bold text-white text-3xl md:text-5xl lg:text-6xl mb-6">
// 						Want to discover AI tools?
// 					</h1>
// 					<button
// 						className="px-10 py-4 rounded-[1.3rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-2xl shadow-xl hover:scale-105 transition-all"
// 						onClick={() => navigate("/discover")}
// 					>
// 						Discover
// 					</button>
// 				</section>
// 				{/* LATEST & TRENDING CAROUSELS */}
// 				<section className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-24 space-y-16">
// 					<ToolCarousel title="Discover Latest Tools in Varous Categories" tools={latestTools} />
// 					<ToolCarousel title="Discover Trending Tools " tools={trendingTools} />
// 				</section>
// 			</main>
// 		</>
// 	);
// };

// export default Index;
