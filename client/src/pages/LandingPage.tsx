import React from "react";
import { Link } from "react-router-dom";
import { FaGuitar, FaDrum, FaMicrophone } from "react-icons/fa";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white text-slate-800">
      <section className="text-center py-20 sm:py-32">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <img
              src="/logo.svg"
              alt="JaMoveo Logo"
              className="w-30 h-30 mx-auto mb-4 animate-fade-in"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-gray-600 animate-fade-in-down">
            Welcome to JaMoveo
          </h1>
          <p className="text-xl md:text-2xl text-orange-600 mb-12 animate-fade-in-up">
            The best place for your band to practice and perform.
          </p>
          <div
            className="space-x-4 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <Link
              to="/register"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition-transform hover:scale-105 shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-4 px-10 rounded-lg text-lg transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 corner-radius-lg">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-3">
            Your Music, Perfectly in Sync
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-8 text-center">
              <FaGuitar className="text-6xl text-orange-500 mx-auto mb-5" />
              <h3 className="text-2xl font-bold mb-3">
                Synced Chords & Lyrics
              </h3>
              <p className="text-gray-600">
                The admin controls the song for everyone. See real-time updates
                on your device, ensuring everyone is on the same page,
                literally.
              </p>
            </div>
            <div className="p-8 text-center">
              <FaDrum className="text-6xl text-orange-500 mx-auto mb-5" />
              <h3 className="text-2xl font-bold mb-3">Custom Views</h3>
              <p className="text-gray-600">
                Musicians see the full picture with chords and lyrics. Singers
                get a clean, lyrics-only view to focus on their performance.
              </p>
            </div>
            <div className="p-8 text-center">
              <FaMicrophone className="text-6xl text-orange-500 mx-auto mb-5" />
              <h3 className="text-2xl font-bold mb-3">Effortless Control</h3>
              <p className="text-gray-600">
                With features like auto-scroll and a simple interface, managing
                the rehearsal flow is a breeze for the session admin.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">Ready to Jam?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Create your account and start your first synchronized rehearsal
            today.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
