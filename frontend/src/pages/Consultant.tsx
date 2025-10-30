import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2, History } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Conversation } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import SpotlightCursor from "../components/spotlight-cursor";
import { SparklesPreviewColorful } from "@/components/ui/demo";

export default function Consultant() {
	const { isLoggedIn } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoggedIn) {
			navigate("/login");
		}
	}, [isLoggedIn, navigate]);

	const [prompt, setPrompt] = useState("");
	const [history, setHistory] = useState<Conversation[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showHistory, setShowHistory] = useState(false);

	const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
	const token = localStorage.getItem("token");

	// Scroll to bottom on new message/reply
	const chatEndRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [history, isLoading]);

	useEffect(() => {
		const fetchHistory = async () => {
			if (!token) return;
			try {
				const response = await fetch(`${API_URL}/api/consultant/history`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.ok) {
					const data: Conversation[] = await response.json();
					setHistory(data);
				}
			} catch (err) {
				// ignore for now
			}
		};
		fetchHistory();
	}, [token]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!prompt.trim() || !token) return;

		setIsLoading(true);
		setError("");

		try {
			const response = await fetch(`${API_URL}/api/consultant`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ prompt }),
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.detail || "Something went wrong");
			}

			const data = await response.json();
			const newRecommendation = data.recommendation;

			const newConversation: Conversation = {
				prompt,
				recommendation: newRecommendation,
				timestamp: new Date().toISOString(),
			};
			setHistory((prev) => [newConversation, ...prev]);
			setPrompt("");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Helmet>
				<title>AI Project Chat Consultant</title>
				<meta
					name="description"
					content="Get a personalized stack of AI tools for your project."
				/>
				<link rel="canonical" href="/consultant" />
			</Helmet>
			<main className="min-h-screen w-full bg-black from-[#090d15] via-[#101720] to-[#131313] flex flex-col items-center">
				<SpotlightCursor />
				<div className="absolute inset-0 w-full h-full">
                    <SparklesPreviewColorful />
                </div>
				{/* Chat container */}
				<section className="w-full max-w-2xl mx-auto flex flex-col grow justify-center md:justify-start pt-10 md:pt-20 pb-8 relative">
					{/* Header */}
					{/* <section className="rounded-xl bg-gradient-primary glow p-6 text-center">
						<h1 className="text-3xl font-semibold text-black">AI Insights</h1>
						<p className="text-muted-foreground mt-2">
							Trends, growth by category, and market signals.
						</p>
					</section> */}

					{/* Chat messages */}
					<div className="relative w-full grow max-h-[50vh] md:max-h-[60vh] overflow-y-auto flex flex-col gap-3 px-0 py-2 scrollbar-thin scrollbar-thumb-[#464752] dark-glass-scrollbar bg-white/0 z-50 text-white">
						{[...history]
							.slice(0, 6)
							.reverse()
							.map((conv, i) => (
								<div key={i} className="flex flex-col items-end gap-2">
									{/* User bubble */}
									<div className="flex items-end gap-2">
										<div className="ml-auto max-w-[81%] glass bg-gradient-to-br from-sky-800/50 via-sky-900/80 to-gray-950/70 text-base p-4 rounded-2xl rounded-br-lg border border-white/10 shadow hover:shadow-primary/40 transition-all">
											<span className="text-white">{conv.prompt}</span>
										</div>
										<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-lg">
											U
										</div>
									</div>
									{/* Bot reply bubble */}
									<div className="flex items-start gap-2">
										<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 via-indigo-400 to-cyan-600 text-white flex items-center justify-center font-bold text-lg">
											AI
										</div>
										<div className="max-w-[89%] glass bg-black/65 ring-1 ring-cyan-500/20 hover:shadow-[0_2px_20px_4px_rgba(0,255,239,0.06)] hover:ring-pink-400/50 text-base rounded-2xl rounded-tl-lg border border-white/10 shadow p-4 mt-0.5 prose prose-invert transition-all">
											<ReactMarkdown>{conv.recommendation}</ReactMarkdown>
										</div>
									</div>
								</div>
							))}
						<div ref={chatEndRef}></div>
					</div>

					{/* Typing bar */}
					<form
						onSubmit={handleSubmit}
						className="w-full sticky bottom-0 z-10 mt-6 flex gap-2 flex-nowrap bg-gradient-to-t from-[#0e1421cc]/80 to-transparent pt-4 pb-2 rounded-b-xl"
					>
						<Textarea
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="Describe your project idea or workflow…"
							className="resize-none min-h-[48px] max-h-[130px] bg-[#181f2a]/90 rounded-xl text-base border border-sky-800 focus:ring-2 focus:ring-pink-500/40 text-white placeholder:text-gray-400"
							disabled={isLoading}
							rows={2}
							maxLength={500}
							spellCheck
							autoFocus
						/>
						<Button
							type="submit"
							disabled={isLoading || !prompt.trim()}
							className="px-4 py-3 ml-2 bg-gradient-to-r from-pink-500 via-indigo-500 to-sky-500 shadow-md rounded-xl ring-1 ring-pink-500/40"
							size="icon"
						>
							{isLoading ? (
								<Loader2 className="animate-spin w-5 h-5" />
							) : (
								<Send className="w-5 h-5" />
							)}
						</Button>
					</form>

					{/* Error or loading state */}
					{isLoading && (
						<div className="absolute left-0 right-0 -top-9 text-center text-sm text-pink-300 animate-pulse">
							Consulting the database and generating a response...
						</div>
					)}
					{error && (
						<div className="text-center text-red-400 py-2">{error}</div>
					)}
				</section>

				{/* Conversation history toggle at bottom */}
				{history.length > 1 && (
					<section className="max-w-2xl w-full px-3 pb-6 mt-3">
						<button
							type="button"
							onClick={() => setShowHistory((v) => !v)}
							className="group flex items-center gap-2 text-gray-400 hover:text-sky-300 text-sm mt-3 mb-1 focus:outline-none"
						>
							<History className="inline w-5 h-5 opacity-80 group-hover:text-pink-400" />
							{showHistory
								? "Hide all previous conversations"
								: "Show all previous conversations"}
						</button>
						{showHistory && (
							<div className="mt-2 space-y-4 animate-in fade-in-50 text-white">
								{[...history]
									.slice(6)
									.reverse()
									.map((conv, i) => (
										<div
											key={i}
											className="glass rounded-xl p-4 animate-in fade-in-50 border border-cyan-500/10 text-white"
										>
											<div className="flex flex-col md:flex-row gap-6 md:gap-10 md:items-start">
												<div className="flex-1">
													<p className="font-semibold text-white">You asked:</p>
													<p className="mb-2 italic text-muted-foreground">
														"{conv.prompt}"
													</p>
													<hr className="border-white/10 my-3" />
													<p className="font-semibold text-white">
														AI Recommended:
													</p>
													<div className="prose max-w-none text-muted-foreground prose-invert">
														<ReactMarkdown>{conv.recommendation}</ReactMarkdown>
													</div>
												</div>
												<div className="min-w-[120px] text-xs text-right text-gray-500 pt-1">
													{new Date(conv.timestamp).toLocaleString()}
												</div>
											</div>
										</div>
									))}
							</div>
						)}
					</section>
				)}
			</main>
		</>
	);
}
