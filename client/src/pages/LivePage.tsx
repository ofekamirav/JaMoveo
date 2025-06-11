import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useAutoScroll } from "../hooks/useAutoScroll";
import SongDisplay from "../components/SongDisplay";

interface SongData {
  id: string;
  title: string;
  artist: string;
  content: { lyrics: string; chords?: string }[][];
}
interface SongMeta {
  id: string;
  title: string;
  artist: string;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";
const socket = io(API_URL, { transports: ["websocket"] });

const LivePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId, instrument, accessToken } = useAuth();
  const { isScrolling, toggleScrolling } = useAutoScroll(50);

  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  const [allSongs, setAllSongs] = useState<SongMeta[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    if (sessionId) {
      fetch(`${API_URL}/rehearsals/${sessionId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Could not fetch session info");
          return res.json();
        })
        .then((session) => {
          setIsAdmin(session.adminId === userId);
          if (session.currentSongId)
            loadSong(session.currentSongId, accessToken);
        })
        .catch(() => navigate("/live/no-session"));

      fetch(`${API_URL}/songs`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then(setAllSongs)
        .catch(() => setError("Could not fetch song list."));

      socket.emit("join-session", sessionId);
      socket.on("song-changed", (songId: string) =>
        loadSong(songId, accessToken)
      );
      socket.on("session-ended", () => {
        if (!isAdmin) navigate("/live/no-session");
      });

      return () => {
        socket.off("song-changed");
        socket.off("session-ended");
      };
    }
  }, [sessionId, navigate, accessToken, userId, isAdmin]);

  const loadSong = async (songId: string, token: string | null) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/songs/${songId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch song");
      setCurrentSong(await res.json());
    } catch {
      setError("Could not load the selected song.");
    }
  };

  const handleChangeSong = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSongId = e.target.value;
    if (!newSongId) return;
    await fetch(`${API_URL}/rehearsals/${sessionId}/song`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ songId: newSongId }),
    });
    socket.emit("change-song", { sessionId, songId: newSongId });
    loadSong(newSongId, accessToken);
  };

  const handleQuitSession = async () => {
    if (!sessionId) return;
    try {
      await fetch(`${API_URL}/rehearsals/${sessionId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      socket.emit("end-session", sessionId);
      navigate("/admin");
    } catch {
      setError("Failed to end session.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-white">
      <h1 className="text-4xl font-bold mb-8">Live Rehearsal</h1>

      {isAdmin && (
        <div className="mb-6 bg-gray-700 p-4 rounded-lg">
          <label className="block mb-2 text-lg">Change Song:</label>
          <select
            onChange={handleChangeSong}
            value={currentSong?.id || ""}
            className="w-full p-3 text-black rounded-md text-lg"
          >
            <option value="">-- Select a Song --</option>
            {allSongs.map((song) => (
              <option key={song.id} value={song.id}>
                {song.title} — {song.artist}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-center mb-4 text-lg">{error}</p>
      )}

      {currentSong ? (
        <SongDisplay
          title={currentSong.title}
          artist={currentSong.artist}
          content={currentSong.content}
          instrument={instrument}
        />
      ) : (
        <div className="text-center mt-20">
          <p className="text-2xl text-gray-400 animate-pulse">
            Waiting for a song to be selected...
          </p>
        </div>
      )}

      <button
        onClick={toggleScrolling}
        className="fixed bottom-5 right-5 bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-orange-700 transition-transform hover:scale-110 text-2xl z-50"
      >
        {isScrolling ? "❚❚" : "▶"}
      </button>

      {isAdmin && (
        <button
          onClick={handleQuitSession}
          className="fixed bottom-5 left-5 bg-red-700 text-white rounded-lg px-6 py-3 flex items-center justify-center shadow-lg hover:bg-red-800 transition-transform hover:scale-110 font-bold z-50"
        >
          Quit
        </button>
      )}
    </div>
  );
};

export default LivePage;
