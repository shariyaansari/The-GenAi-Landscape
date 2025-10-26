import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import ToolCard from "@/components/ToolCard";

type ToolCarouselProps = {
	title: string;
	tools: any[];
};

export default function ToolCarousel({ title, tools }: ToolCarouselProps) {
	return (
		<section className="space-y-7 mt-12">
			<h2 className="text-2xl font-semibold tracking-tight">{title}</h2>

			<Swiper
				effect="coverflow"
				grabCursor
				centeredSlides
				slidesPerView="auto"
				coverflowEffect={{
					rotate: 0,
					stretch: 0,
					depth: 180,
					modifier: 1.7,
					slideShadows: true,
				}}
				autoplay={{ delay: 4000, disableOnInteraction: false }}
				modules={[EffectCoverflow, Autoplay]}
				className="pb-12"
				style={{ paddingTop: 32, paddingBottom: 48 }}
			>
				{tools.map((tool) => (
					<SwiperSlide
						key={tool.id}
						className="!w-[320px] sm:!w-[350px] md:!w-[380px] flex items-center justify-center"
					>
						<div className="transition-transform duration-300 will-change-transform">
							<ToolCard tool={tool} />
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</section>
	);
}
