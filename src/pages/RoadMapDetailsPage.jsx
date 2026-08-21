import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Link as LinkIcon,
  CheckCircle,
  Circle,
} from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const RoadMapDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoadMapDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/roadmaps/${id}`);
      setRoadmap(response.data.data);
    } catch (err) {
      console.error("Error fetching roadmap details:", err);
      setError("Failed to load roadmap details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadMapDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading roadmap..." />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-error mb-3">{error || "Roadmap not found"}</p>
          <button
            onClick={() => navigate("/roadmaps")}
            className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-semibold transition-colors"
          >
            Back to Roadmaps
          </button>
        </div>
      </div>
    );
  }

  const nodes = roadmap.nodes || [];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/roadmaps")}
        className="flex items-center gap-2 text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Roadmaps</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={24} className="text-accent" />
          <h1 className="gradient-title text-3xl font-bold">{roadmap.title}</h1>
        </div>
        <p className="text-muted text-lg">{roadmap.description}</p>
        <p className="text-xs text-muted mt-2">
          {nodes.length} steps • Created{" "}
          {new Date(roadmap.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Nodes List */}
      <div className="space-y-4">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="glass-card p-4 flex items-start gap-4 hover:border-accent/30 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm">
                {node.step_number || index + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold mb-1">{node.title}</h3>
              {node.url && (
                <a
                  href={node.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  <LinkIcon size={12} />
                  {node.url.replace(/^https?:\/\//, "").slice(0, 50)}
                </a>
              )}
            </div>
            {node.url && (
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-xs transition-colors"
              >
                Learn More →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="text-center py-12 glass-card">
          <p className="text-muted">No steps available for this roadmap yet.</p>
        </div>
      )}
    </div>
  );
};

export default RoadMapDetailsPage;
