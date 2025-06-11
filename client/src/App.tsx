import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import LivePage from "./pages/LivePage";
import AdminResultsWithSearch from "./pages/AdminResultsWithSearch";
import NoSessionPage from "./pages/NoSessionPage";
import LandingPage from "./pages/LandingPage";

function App() {
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

          <Route path="/live/no-session" element={<NoSessionPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
