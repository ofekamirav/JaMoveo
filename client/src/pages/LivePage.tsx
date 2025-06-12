import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../services/SocketService";
import { useAuth } from "../services/AuthContext";
import { useAutoScroll } from "../hooks/useAutoScroll";
import SongDisplay from "../components/SongDisplay";
import PlayerWaitingPage from "./PlayerWaitingPage";
import { getInstrumentIcon } from "../types/instrument";

interface SongData {
  _id: string;
  title: string;
  artist: string;
  content: { lyrics: string; chords?: string }[][];
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const LivePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, accessToken, isLoading } = useAuth();
  const { isScrolling, toggleScrolling, startScrolling, stopScrolling } =
    useAutoScroll(50);
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const loadSong = useCallback(
    async (songId: string) => {
      if (!accessToken) return;
      setError("");
      try {
        const res = await fetch(`${API_URL}/songs/${songId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch song data");
        setCurrentSong(await res.json());
      } catch (err: any) {
        setError(err.message || "Could not load song.");
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (!isLoading && !accessToken) navigate("/login");
  }, [isLoading, accessToken, navigate]);

  const handleSessionEnded = useCallback(() => {
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/live/no-session");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (accessToken && sessionId && user) {
      const joinAndFetchSession = async () => {
        try {
          await fetch(`${API_URL}/rehearsals/${sessionId}/join`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          socket.emit("join-session", sessionId);

          const res = await fetch(`${API_URL}/rehearsals/${sessionId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!res.ok) {
            throw new Error("Session not found or inactive after joining");
          }

          const session = await res.json();
          if (session.currentSongId) {
            loadSong(session.currentSongId);
          }
        } catch (err) {
          console.error("Failed to join or fetch session:", err);
          if (window.location.pathname.includes("/live/")) {
            navigate("/live/no-session");
          }
        }
      };

      joinAndFetchSession();

      socket.on("session-ended", handleSessionEnded);

      return () => {
        socket.emit("leave-session", sessionId);
        socket.off("session-ended", handleSessionEnded);
      };
    }
  }, [user, sessionId, accessToken, navigate, handleSessionEnded, loadSong]);

  useEffect(() => {
    const handleScrollState = (data: { shouldScroll: boolean }) => {
      if (data.shouldScroll) {
        startScrolling();
      } else {
        stopScrolling();
      }
    };
    socket.on("scroll-state-changed", handleScrollState);
    return () => {
      socket.off("scroll-state-changed", handleScrollState);
    };
  }, [startScrolling, stopScrolling]);

  const handleToggleScrollForAdmin = () => {
    toggleScrolling();
    socket.emit("toggle-scroll", { sessionId, shouldScroll: !isScrolling });
  };

  const handleQuitSession = async () => {
    if (!accessToken || !sessionId) return;
    try {
      const response = await fetch(`${API_URL}/rehearsals/quit/${sessionId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to end session.");
      }
    } catch (err: any) {
      setError(err.message || "Could not end session. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="text-center mt-40">Initializing...</div>;
  }

  return (
    <div className="bg-white max-w-5xl mx-auto px-4 py-10 text-gray-800">
      {user?.instrument && (
        <div className="fixed top-20 right-5 bg-white/80 backdrop-blur-md text-gray-800 px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 border border-gray-200 z-40">
          <span>{getInstrumentIcon(user.instrument) || "🎶"}</span>
          <span className="font-semibold capitalize">{user.instrument}</span>
        </div>
      )}

      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md text-center mb-4">
          {error}
        </p>
      )}

      {currentSong ? (
        <SongDisplay
          title={currentSong.title}
          artist={currentSong.artist}
          content={currentSong.content}
          instrument={user?.instrument || null}
        />
      ) : (
        <PlayerWaitingPage forAdmin={isAdmin} />
      )}

      {isAdmin && (
        <button
          onClick={handleToggleScrollForAdmin}
          className="fixed bottom-5 right-5 bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-orange-700 transition-transform hover:scale-110 text-2xl z-50"
        >
          {isScrolling ? "❚❚" : "►"}
        </button>
      )}
      {isAdmin && (
        <button
          onClick={handleQuitSession}
          className="fixed bottom-5 left-5 bg-blue-900 hover:bg-blue-700 text-white font-semibold px-6 h-16 rounded-full shadow-lg transition-transform hover:scale-110 text-lg z-50"
        >
          End Session
        </button>
      )}
    </div>
  );
};

export default LivePage;
