import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export default function ToolCard({ tool }) {
	const { isLoggedIn } = useAuth();
	const navigate = useNavigate();

	const keywords = Array.isArray(tool.categories)
		? tool.categories.slice(0, 2)
		: tool.categories
		? [tool.categories]
		: [];

	const handleClick = (e) => {
		if (!isLoggedIn) {
			e.preventDefault();
			navigate("/login");
		}
	};

	return (
		<Link to={`/tools/${tool.id}`} onClick={handleClick} tabIndex={-1}>
			<div
				className="card-glossy neon-hover relative group 
        h-[270px] w-[310px] select-none 
        flex flex-col items-center justify-center text-center
        bg-black/5 backdrop-blur-md border border-white/10 
        rounded-2xl transition-all duration-300 
        hover:scale-[1.025] hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
			>
				{/* Main card content */}
				<div className="flex flex-col items-center justify-center h-full">
					{tool.logoUrl && (
						<div className="w-16 h-16 bg-black/10 rounded-xl flex items-center justify-center border border-white/20 shadow-md">
							<img
								src={tool.logoUrl}
								alt={tool.name}
								className="w-12 h-12 object-contain"
								draggable={false}
							/>
						</div>
					)}

					<div className="mt-3 text-lg font-semibold text-white">
						{tool.name}
					</div>

					<div className="mt-1 text-xs text-white/60 font-medium uppercase tracking-wide">
						{tool.pricingModel}
					</div>

					<div className="mt-2 flex gap-2 justify-center flex-wrap">
						{keywords.map((kw, idx) => (
							<Badge
								key={kw + idx}
								className="bg-black border-none text-white text-xs py-1 px-2"
							>
								{kw}
							</Badge>
						))}
					</div>
				</div>

				{/* Hover overlay description */}
				<div
					className="absolute inset-0 z-20 flex items-center justify-center
        opacity-0 group-hover:opacity-100 transition-all duration-300
        bg-gradient-to-b from-black/60 via-black/80 to-black/90 
        rounded-2xl p-6 backdrop-blur-lg border border-white/10
        text-gray-100 text-[0.9rem] leading-relaxed font-medium"
				>
					<div className="max-h-[80%] overflow-y-auto px-1 dark-glass-scrollbar">
						{tool.description || "No description available."}
					</div>
				</div>
			</div>
		</Link>
	);
}
