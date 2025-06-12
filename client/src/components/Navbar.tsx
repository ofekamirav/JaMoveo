import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const activeLinkStyle = "bg-orange-600 text-white";
  const inactiveLinkStyle =
    "text-gray-600 hover:bg-orange-100 hover:text-orange-700";

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-900 hover:text-orange-600 transition-colors duration-300"
            >
              JaMoveo
            </Link>

            {user && (
              <span className="text-gray-800 font-medium text-sm hidden sm:inline">
                Hello, {user.name}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `font-medium px-3 py-2 rounded-lg text-sm transition-colors duration-300 ${
                      isActive ? activeLinkStyle : inactiveLinkStyle
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `font-medium px-3 py-2 rounded-lg text-sm transition-colors duration-300 ${
                      isActive ? activeLinkStyle : inactiveLinkStyle
                    }`
                  }
                >
                  Registration
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
