import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import LivePage from "./pages/LivePage";
import AdminResultsWithSearch from "./pages/AdminResultsWithSearch";
import PlayerWaitingPage from "./pages/PlayerWaitingPage";
import LandingPage from "./pages/LandingPage";
import { useAuth } from "./services/AuthContext";

function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  return (
    <div className="bg-white-900 text-slate-200 min-h-screen font-sans">
      <Navbar />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route
            path="/admin/register"
            element={<SignupPage isAdmin={true} />}
          />

          <Route path="/admin" element={<AdminResultsWithSearch />} />

          <Route path="/live/:sessionId" element={<LivePage />} />

          <Route
            path="/live/session-ended"
            element={<PlayerWaitingPage forAdmin={isAdmin} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
