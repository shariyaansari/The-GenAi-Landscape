import { Helmet } from "react-helmet-async";
import { SparklesPreviewColorful } from "@/components/ui/demo";
import { useNavigate } from "react-router-dom"; // For React Router
import SpotlightCursor from "../components/spotlight-cursor";


const Index = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Gen AI Landscape</title>
        <meta name="description" content="Discover the future of AI by exploring top tools." />
        <link rel="canonical" href="/" />
      </Helmet>
      <main className="relative min-h-screen w-full bg-black overflow-hidden">
        <SpotlightCursor />
        {/* Full-page sparkles background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesPreviewColorful />
        </div>
        {/* Center all content */}
        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4">
          <h1 className="font-bold text-white text-3xl md:text-5xl lg:text-6xl text-center mb-6">
            Want to discover AI tools?
          </h1>
          <button
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-xl shadow-lg hover:scale-105 focus:outline-none transition-all"
            onClick={() => navigate('/trends')}
          >
            Discover
          </button>
        </div>
      </main>
    </>
  );
};

export default Index;
