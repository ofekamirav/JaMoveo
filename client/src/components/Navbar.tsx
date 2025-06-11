import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, logout, name } = useAuth();

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
            {isLoggedIn && name && (
              <span className="text-gray-800 font-medium text-sm hidden sm:inline">
                Hello, {name}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {isLoggedIn ? (
              <button
                onClick={logout}
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
