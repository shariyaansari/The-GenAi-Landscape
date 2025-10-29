import { Helmet } from "react-helmet-async";
import { SparklesPreviewColorful } from "@/components/ui/demo";
import { useNavigate } from "react-router-dom"; // For React Router
import SpotlightCursor from "../components/spotlight-cursor";
import { tools } from "@/data/tools";
import ToolCarousel from "@/components/ToolCarousel";
import { useRef, useEffect, useState } from "react";

const Index = () => {
	const navigate = useNavigate();
	const [showHeader, setShowHeader] = useState(false);
	const heroRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new window.IntersectionObserver(
			([entry]) => setShowHeader(!entry.isIntersecting),
			{ threshold: 0.2 }
		);
		if (heroRef.current) observer.observe(heroRef.current);
		return () => observer.disconnect();
	}, []);

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
				<section
					ref={heroRef}
					className="relative z-10 flex flex-col justify-center items-center text-center min-h-[70vh] px-4"
					style={{ minHeight: "calc(100vh - 7rem)" }}
				>
					<div className="mt-20" /> {/* This pushes the content further down */}
					<h1 className="font-bold text-white text-3xl md:text-5xl lg:text-6xl mb-7">
						Want to discover AI tools?
					</h1>
					<button
						className="px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-2xl shadow-xl hover:scale-105 focus:outline-none transition-all"
						onClick={() => navigate("/trends")}
					>
						Discover
					</button>
				</section>

				<div
					className={`
      fixed left-1/2 top-8 z-40 -translate-x-1/2 transition-all duration-500 ease-out
      w-[97vw] max-w-7xl
      ${
				showHeader
					? "opacity-100 scale-100 pointer-events-auto"
					: "opacity-0 scale-95 pointer-events-none"
			}
    `}
					style={{ pointerEvents: showHeader ? "auto" : "none" }}
				>
					{/* <section> for styled glass header, NOT the carousels */}
					<section className="rounded-xl bg-gradient-primary glow p-6 text-center relative z-10">
						<h1 className="text-3xl font-semibold text-black">
							Check Out the Latest AI tools
						</h1>
						<p className="text-muted-foreground mt-2">
							Emerging tools, rising categories, and breakthrough tech.
						</p>
					</section>
				</div>

				{/* --- CAROUSELS BELOW --- */}
				<section className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-24 text-black align-middle">
					<div className="mt-10" />
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
// import SpotlightCursor from "../components/spotlight-cursor";
// import { tools } from "@/data/tools";
// import ToolCarousel from "@/components/ToolCarousel";
// import { useRef, useEffect, useState } from "react";

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

// 	// Scroll-triggered glass header logic
// 	const [showHeader, setShowHeader] = useState(false);
// 	const heroRef = useRef<HTMLDivElement>(null);
// 	useEffect(() => {
// 		const observer = new window.IntersectionObserver(
// 			([entry]) => setShowHeader(!entry.isIntersecting),
// 			{ threshold: 0.2 }
// 		);
// 		if (heroRef.current) observer.observe(heroRef.current);
// 		return () => observer.disconnect();
// 	}, []);

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
// 			<main className="relative min-h-screen w-full bg-black overflow-hidden">
// 				<SpotlightCursor />
// 				{/* Full-page sparkles background */}
// 				<div className="absolute inset-0 w-full h-full">
// 					<SparklesPreviewColorful />
// 				</div>
// 				{/* --- HERO --- */}
// 				<section
// 					ref={heroRef}
// 					className="relative z-10 flex flex-col justify-center items-center text-center min-h-[70vh] px-4 "
// 				>
// 					<h1 className="font-bold text-white text-3xl md:text-5xl lg:text-6xl mb-6">
// 						Want to discover AI tools?
// 					</h1>
// 					<button
// 						className="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-xl shadow-lg hover:scale-105 focus:outline-none transition-all"
// 						onClick={() => navigate("/trends")}
// 					>
// 						Discover
// 					</button>
// 				</section>

// 				{/* Sticky glass header, appears after hero */}
// 				<div
// 					className={`
//             fixed left-1/2 top-8 z-40 -translate-x-1/2 transition-all duration-500 ease-out
//             w-[96vw] max-w-7xl
//             ${
// 							showHeader
// 								? "opacity-100 scale-100 pointer-events-auto"
// 								: "opacity-0 scale-95 pointer-events-none"
// 						}
//         `}
// 					style={{ pointerEvents: showHeader ? "auto" : "none" }}
// 				>
// 					<div
// 						className="rounded-[2rem] px-6 py-7 shadow-2xl flex flex-col justify-center items-center
//         bg-gradient-to-br from-[#edeaff]/80 via-[#fdefff]/80 to-[#e6fafe]/80
//         "
// 						style={{
// 							backdropFilter: "blur(12px)",
// 							WebkitBackdropFilter: "blur(12px)",
// 						}}
// 					>
// 						<h2 className="text-[2rem] md:text-4xl font-bold text-black tracking-tight mb-1 text-center">
// 							Discover what's next in AI
// 						</h2>
// 						<p className="text-lg md:text-xl font-medium text-[#64748b] text-center max-w-2xl">
// 							Emerging tools, rising categories, and breakthrough tech.
// 						</p>
// 					</div>
// 				</div>

// 				{/* --- CAROUSELS BELOW --- */}
// 				<section className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-24 text-black align-middle">
// 					<div className="pt-12" />
// 					<ToolCarousel
// 						title="Discover Latest Tools in Various Categories"
// 						tools={latestTools}
// 					/>
// 					<ToolCarousel title="Discover Trending Tools" tools={trendingTools} />
// 				</section>
// 			</main>
// 		</>
// 	);
// };

// export default Index;
