import { useState } from "react";
import {
	BarChart,
	Bar,
	Cell,
	Tooltip,
	ResponsiveContainer,
	AreaChart,
	Area,
	CartesianGrid,
	XAxis,
	YAxis,
	Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	pricingModelCounts,
	releasesOverTime,
	categoryGrowth,
} from "@/data/tools";

// Premium accessible color palette (WCAG-compliant)
const CHART_COLORS = [
	"#0074D9", // blue[1]
	"#2ECC40", // green[5]
	"#FF4136", // red[1]
	"#B10DC9", // purple[10]
	"#FFDC00", // yellow[5]
	"#3D9970", // teal[1]
	"#85144b", // maroon[10]
];

// Format large numbers
const formatNumber = (num) =>
	num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;

// --- Data processing helpers ---

const processPricingData = (data, topN = 8) => {
	const sortedData = [...data].sort((a, b) => b.value - a.value);
	const mainModels = sortedData.slice(0, topN);
	const otherModels = sortedData.slice(topN);
	const otherValue = otherModels.reduce((acc, curr) => acc + curr.value, 0);
	if (otherValue > 0) {
		return [...mainModels, { name: "Other", value: otherValue }];
	}
	return mainModels;
};

const processGrowthData = (data, topN = 5) => {
	if (data.length === 0) return { data: [], categories: [] };
	const categoryTotals = data.reduce((acc, curr) => {
		acc[curr.category] = (acc[curr.category] || 0) + curr.value;
		return acc;
	}, {});
	const sortedCategories = Object.keys(categoryTotals).sort(
		(a, b) => categoryTotals[b] - categoryTotals[a]
	);
	const topCategories = sortedCategories.slice(0, topN);
	const months = [...new Set(data.map((d) => d.month))].sort();
	const pivotedData = months.map((m: string) => {
		const row = {
			month: new Date(m).toLocaleDateString("en-US", { month: "short" }),
			Other: 0,
		};
		topCategories.forEach((c) => (row[c] = 0));
		data
			.filter((d) => d.month === m)
			.forEach((d) => {
				if (topCategories.includes(d.category)) {
					row[d.category] = d.value;
				} else {
					row.Other += d.value;
				}
			});
		return row;
	});
	return { data: pivotedData, categories: [...topCategories, "Other"] };
};

export default function InsightsSection() {
	const [selectedYear, setSelectedYear] = useState("All");
	const pricing = processPricingData(pricingModelCounts());
	const allRawReleases = releasesOverTime();
	const allRawGrowth = categoryGrowth();

	const availableYears = [
		"All",
		...Array.from(
			new Set(allRawReleases.map((d) => new Date(d.month).getFullYear()))
		).sort((a, b) => b - a),
	];

	// Filtered data by year
	const filteredReleases = (
		selectedYear === "All"
			? allRawReleases
			: allRawReleases.filter(
					(item) =>
						new Date(item.month).getFullYear().toString() === selectedYear
			  )
	).map((item) => ({
		...item,
		month: new Date(item.month).toLocaleDateString("en-US", { month: "short" }),
	}));

	const filteredGrowthRaw =
		selectedYear === "All"
			? allRawGrowth
			: allRawGrowth.filter(
					(item) =>
						new Date(item.month).getFullYear().toString() === selectedYear
			  );

	const { data: growth, categories } = processGrowthData(filteredGrowthRaw);

	return (
		<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card className="glass col-span-1 md:col-span-2 text-white">
				<CardHeader>
					<CardTitle className="text-muted-foreground">Pricing Model Distribution</CardTitle>
				</CardHeader>
				<CardContent className="h-80">
					<ResponsiveContainer width="100%" height="95%">
						<BarChart
							data={pricing}
							margin={{ top: 16, right: 32, left: 4, bottom: 32 }}
							barCategoryGap="30%"
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis
								dataKey="name"
								angle={-25}
								textAnchor="end"
								tick={{ fontSize: 14, fill: "#333" }}
								height={50}
								axisLine={false}
								tickLine={false}
							/>
							<YAxis
								tickFormatter={formatNumber}
								tick={{ fontSize: 14, fill: "#333" }}
								axisLine={false}
								tickLine={false}
							/>
							<Tooltip
								itemStyle={{ color: "#0074D9", fontWeight: 600 }}
								contentStyle={{
									background: "#fff",
									border: "1px solid #e2e8f0",
									boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
								}}
							/>
							<Legend wrapperStyle={{ fontSize: 15, marginBottom: -10 }} />
							<Bar
								dataKey="value"
								radius={[8, 8, 0, 0]}
								maxBarSize={40}
								label={{
									position: "top",
									fill: "#0074D9",
									fontWeight: "bold",
									fontSize: 13,
								}}
							>
								{pricing.map((entry, index) => (
									<Cell
										key={`${entry.name}-${index}`}
										fill={CHART_COLORS[index % CHART_COLORS.length]}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Year Selector & Filtered Charts */}
			<div className="md:col-span-2 grid grid-cols-1 gap-6">
				<div className="flex justify-end items-center gap-2">
					<span className="text-sm font-medium">Filter by Year:</span>
					<Select value={selectedYear} onValueChange={setSelectedYear}>
						<SelectTrigger className="w-[180px] text-black">
							<SelectValue placeholder="Select a year" />
						</SelectTrigger>
						<SelectContent>
							{availableYears.map((year) => (
								<SelectItem key={year} value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Release Timeline Chart */}
					<Card className="glass shadow-lg rounded-xl border border-neutral-200 p-0 text-muted-foreground">
						<CardHeader>
							<CardTitle>Release Timeline</CardTitle>
						</CardHeader>
						<CardContent className="h-80">
							<ResponsiveContainer width="100%" height="95%">
								<AreaChart
									data={filteredReleases}
									margin={{ top: 16, right: 32, left: 4, bottom: 24 }}
								>
									<defs>
										<linearGradient
											id="colorReleases"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="#0074D9"
												stopOpacity={0.65}
											/>
											<stop
												offset="95%"
												stopColor="#0074D9"
												stopOpacity={0.1}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="4 2" stroke="#e2e8f0" />
									<XAxis
										dataKey="month"
										tick={{ fontSize: 13, fill: "#333" }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										tickFormatter={formatNumber}
										tick={{ fontSize: 13, fill: "#333" }}
										axisLine={false}
										tickLine={false}
									/>
									<Tooltip
										contentStyle={{
											background: "#fff",
											borderColor: "#e2e8f0",
										}}
										labelStyle={{ color: "#0074D9", fontWeight: "bold" }}
									/>
									<Area
										type="monotone"
										dataKey="count"
										stroke="#0074D9"
										strokeWidth={2.5}
										fill="url(#colorReleases)"
										activeDot={{ r: 6 }}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Growth by Category Chart */}
					<Card className="glass shadow-lg rounded-xl border border-neutral-200 p-0 text-muted-foreground">
						<CardHeader>
							<CardTitle>Growth by Category</CardTitle>
						</CardHeader>
						<CardContent className="h-80">
							<ResponsiveContainer width="100%" height="95%">
								<AreaChart
									data={growth}
									margin={{ top: 16, right: 32, left: 4, bottom: 24 }}
								>
									<defs>
										{categories.map((c, i) => (
											<linearGradient
												key={c}
												id={`color${c}`}
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor={CHART_COLORS[i % CHART_COLORS.length]}
													stopOpacity={0.65}
												/>
												<stop
													offset="95%"
													stopColor={CHART_COLORS[i % CHART_COLORS.length]}
													stopOpacity={0.1}
												/>
											</linearGradient>
										))}
									</defs>
									<CartesianGrid strokeDasharray="4 2" stroke="#e2e8f0" />
									<XAxis
										dataKey="month"
										tick={{ fontSize: 13, fill: "#333" }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										tickFormatter={formatNumber}
										tick={{ fontSize: 13, fill: "#333" }}
										axisLine={false}
										tickLine={false}
									/>
									<Tooltip
										contentStyle={{
											background: "#fff",
											borderColor: "#e2e8f0",
										}}
										labelStyle={{ color: "#0074D9", fontWeight: "bold" }}
									/>
									<Legend wrapperStyle={{ fontSize: 14, marginTop: 12 }} />
									{categories.map((c, i) => (
										<Area
											key={c}
											type="monotone"
											dataKey={c}
											name={c}
											stackId="1"
											stroke={CHART_COLORS[i % CHART_COLORS.length]}
											fill={`url(#color${c})`}
											strokeWidth={2.5}
											activeDot={{ r: 6 }}
										/>
									))}
								</AreaChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
