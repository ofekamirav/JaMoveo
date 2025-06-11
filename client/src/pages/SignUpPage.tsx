import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SignupPageProps {
  isAdmin?: boolean;
}

const instruments = [
  "Drums",
  "Guitar",
  "Bass",
  "Saxophone",
  "Keyboards",
  "Vocals",
  "Piano",
  "Chello",
  "Violin",
];

const SignupPage: React.FC<SignupPageProps> = ({ isAdmin = false }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [instrument, setInstrument] = useState(instruments[0]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name || !email || !password || (!isAdmin && !instrument)) {
      setError("You must fill in all required fields.");
      return;
    }

    const url = `${API_BASE_URL}/auth/${
      isAdmin ? "admin/register" : "register"
    }`;
    const body = isAdmin
      ? { name, email, password }
      : { name, email, password, instrument };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Registration failed");
      }

      setSuccessMessage(
        `${isAdmin ? "Admin" : "Player"} successfully registered!`
      );
      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
        instrument: data.instrument,
      });
      navigate(isAdmin ? "/admin" : "/live");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-blue-900">
          {isAdmin ? "Admin Registration" : "Create Account"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              required
            />
          </div>
          {!isAdmin && (
            <div>
              <label
                htmlFor="instrument"
                className="block text-sm font-medium text-gray-700"
              >
                Instrument
              </label>
              <select
                id="instrument"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-sm transition"
                required
              >
                {instruments.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {successMessage && (
            <p className="text-green-500 text-sm text-center">
              {successMessage}
            </p>
          )}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            {isAdmin ? "Register as Admin" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
