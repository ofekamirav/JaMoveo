// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import LivePage from "./pages/LivePage";
import AdminResultsWithSearch from "./pages/AdminResultsWithSearch";

function App() {
  return (
    <div className="bg-white-900 text-slate-200 min-h-screen font-sans">
      <Navbar />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route
            path="/"
            element={
              <div className="text-center mt-20">
                <h1 className="text-blue-900 text-5xl font-extrabold mb-4">
                  Welcome to JaMoveo
                </h1>
                <p className="text-xl text-orange-600">
                  The best place for your band to practice and perform.
                </p>
              </div>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route
            path="/admin/register"
            element={<SignupPage isAdmin={true} />}
          />

          <Route path="/admin" element={<AdminResultsWithSearch />} />

          <Route path="/live/:songId" element={<LivePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
