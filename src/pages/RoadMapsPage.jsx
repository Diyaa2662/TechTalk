import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, BookOpen, ArrowRight } from "lucide-react";
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
            className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <BookOpen size={48} className="text-muted mx-auto mb-3" />
          <p className="text-muted text-lg">No roadmaps available</p>
          <p className="text-label text-sm mt-1">
            Check back later for new learning paths
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <MapPin size={28} className="text-accent" />
        <h1 className="gradient-title text-2xl font-bold">Learning Roadmaps</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roadmaps.map((roadmap) => (
          <Link
            key={roadmap.id}
            to={`/roadmaps/${roadmap.id}`}
            className="glass-card-hover p-5 group"
          >
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
              {roadmap.title}
            </h3>
            <p className="text-muted text-sm mb-3 line-clamp-3">
              {roadmap.description}
            </p>
            <div className="flex items-center justify-end text-xs text-muted">
              <span className="flex items-center gap-1 text-accent group-hover:gap-2 transition-all">
                View Roadmap <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoadMapsPage;
