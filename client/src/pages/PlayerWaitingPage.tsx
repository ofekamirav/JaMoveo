import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMusic, FaHourglassHalf } from "react-icons/fa";
import { useAuth } from "../services/AuthContext";
import { socket } from "../services/SocketService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

interface PlayerWaitingPageProps {
  forAdmin?: boolean;
}

const PlayerWaitingPage: React.FC<PlayerWaitingPageProps> = ({
  forAdmin = false,
}) => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const title = forAdmin ? "Loading Session..." : "Waiting for next song...";
  const subtitle = forAdmin
    ? "Hang tight, we're setting up the stage for you."
    : "The admin is choosing a song. Get your instrument ready!";

  useEffect(() => {
    socket.on("session-created", async () => {
      if (!accessToken) return;

      try {
        const res = await fetch(`${API_URL}/rehearsals/active`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("No active session found");
        const session = await res.json();
        navigate(`/live/${session._id}`);
      } catch (err) {
        console.error("Error joining new session:", err);
      }
    });

    return () => {
      socket.off("session-created");
    };
  }, [accessToken, navigate]);

  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-700 min-h-[calc(100vh-200px)]">
      <div className="relative mb-8">
        <FaMusic className="text-7xl text-gray-400 animate-pulse" />
        <FaHourglassHalf className="absolute text-3xl text-orange-500 -bottom-2 -right-3 animate-spin [animation-duration:3s]" />
      </div>

      <h1 className="text-5xl font-extrabold tracking-tight text-blue-900 mb-4">
        {title}
      </h1>

      <p className="max-w-xl text-lg text-gray-500 mb-10">{subtitle}</p>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-100/50 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
};

export default PlayerWaitingPage;
