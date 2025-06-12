import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

interface SongResult {
  id: string;
  title: string;
  artist: string;
}

const AdminResultsWithSearch: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongResult[]>([]);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const { accessToken } = useAuth();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  useEffect(() => {
    const initialQuery = new URLSearchParams(location.search).get("q") || "";
    setQuery(initialQuery);
    if (initialQuery) {
      fetchResults(initialQuery);
    }
  }, [location.search]);

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    try {
      if (!accessToken) throw new Error("User is not authenticated");

      const res = await fetch(`${API_URL}/songs/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load results");
      setResults(data);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/admin/?q=${encodeURIComponent(query)}`);
  };

  const handleSelectSong = async (songId: string) => {
    setIsCreatingSession(true);
    setError("");
    try {
      if (!accessToken) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/rehearsals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentSongId: songId }),
      });

      const session = await response.json();
      if (!response.ok) {
        throw new Error(session.message || "Failed to create session.");
      }
      navigate(`/live/${session._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const showNoResultsMessage = !loading && query && results.length === 0;

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">
        Search for a Song
      </h2>
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-white bg-gray-800 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Enter song or artist (English)"
        />
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {loading && (
        <div className="text-white text-center mt-8 animate-pulse">
          Loading results...
        </div>
      )}

      {showNoResultsMessage ? (
        <div className="text-gray-400 text-center mt-8">
          No songs found for "<span className="italic">{query}</span>".
          <br />
          Please try another search.
        </div>
      ) : (
        <ul className="space-y-4">
          {results.map((song) => (
            <li
              key={song.id}
              className="p-4 bg-gray-800 rounded-lg shadow flex justify-between items-center hover:bg-gray-700 transition"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {song.title}
                </h3>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
              <button
                onClick={() => handleSelectSong(song.id)}
                disabled={isCreatingSession}
                className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-md"
              >
                {isCreatingSession ? (
                  <span className="animate-spin">Creating...</span>
                ) : (
                  "Start Rehearsal"
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminResultsWithSearch;
