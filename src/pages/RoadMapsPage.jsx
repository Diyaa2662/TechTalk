import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const RoadMapsPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoadMaps = async () => {
    try {
      setLoading(true);
      const response = await api.get("/roadmaps");
      setRoadmaps(response.data.data || []);
    } catch (err) {
      console.error("Error fetching roadmaps:", err);
      setError("Failed to load roadmaps. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadMaps();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading roadmaps..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-error mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#5CA1FC]/10 rounded-full flex items-center justify-center pulse-ring">
            <BookOpen size={48} className="text-[#5CA1FC]/60" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            No Roadmaps Available
          </h2>
          <p className="text-muted text-sm">
            Check back later for new learning paths to boost your skills! 🚀
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[#5CA1FC]/10">
          <MapPin size={24} className="text-[#5CA1FC]" />
        </div>
        <h1 className="gradient-title text-2xl font-bold">Learning Roadmaps</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roadmaps.map((roadmap) => (
          <Link
            key={roadmap.id}
            to={`/roadmaps/${roadmap.id}`}
            className="glass-card p-5 hover:border-[#5CA1FC]/40 hover:shadow-[0_4px_20px_rgba(92,161,252,0.15)] transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-[#5CA1FC] transition-colors line-clamp-2">
                {roadmap.title}
              </h3>
              <Sparkles
                size={16}
                className="text-[#5CA1FC]/50 flex-shrink-0 ml-2 mt-1"
              />
            </div>
            <p className="text-muted text-sm mb-4 line-clamp-3">
              {roadmap.description}
            </p>
            <div className="flex items-center justify-end text-xs">
              <span className="flex items-center gap-1 text-[#5CA1FC] group-hover:gap-2 transition-all duration-300 font-medium">
                View Roadmap{" "}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoadMapsPage;
