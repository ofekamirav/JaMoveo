import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

interface SongData {
  title: string;
  artist: string;
  lyrics: string;
  chords: string;
}

const LivePage: React.FC = () => {
  const { songId } = useParams();
  const { role, instrument, logout } = useAuth();
  const navigate = useNavigate();
  const [song, setSong] = useState<SongData | null>(null);
  const [error, setError] = useState("");
  const [scrolling, setScrolling] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/songs/${songId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch song");
        setSong(data);
      } catch (err: any) {
        setError(err.message || "Error loading song");
      }
    };

    fetchSong();
  }, [songId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scrolling) {
      interval = setInterval(() => {
        window.scrollBy({ top: 1, behavior: "smooth" });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [scrolling]);

  const isSinger = instrument?.toLowerCase() === "vocals";

  const handleQuit = () => {
    logout();
    navigate("/admin");
  };

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!song) {
    return (
      <div className="text-center mt-10 text-gray-300">Loading song...</div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white px-4 py-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
        <h2 className="text-xl mb-6 text-gray-300">by {song.artist}</h2>

        {!isSinger && (
          <pre className="whitespace-pre-wrap text-lg text-green-400 mb-8">
            {song.chords}
          </pre>
        )}
        <pre className="whitespace-pre-wrap text-2xl leading-relaxed text-white">
          {song.lyrics}
        </pre>

        <div className="fixed bottom-4 right-4 flex flex-col gap-4">
          <button
            onClick={() => setScrolling(!scrolling)}
            className="bg-red-600 hover:bg-red-800 px-4 py-2 rounded-md shadow text-white font-medium transition"
          >
            {scrolling ? "Stop Scroll" : "Start Scroll"}
          </button>

          {role === "admin" && (
            <button
              onClick={handleQuit}
              className="bg-gray-700 hover:bg-gray-500 px-4 py-2 rounded-md shadow text-white font-medium transition"
            >
              Quit Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePage;
