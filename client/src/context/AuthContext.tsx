import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: "admin" | "player" | null;
  instrument: string | null;
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (data: Partial<AuthState>) => void;
  logout: () => void;
}

const defaultState: AuthState = {
  accessToken: null,
  refreshToken: null,
  role: null,
  instrument: null,
  isLoggedIn: false,
};

const AuthContext = createContext<AuthContextType>({
  ...defaultState,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>(defaultState);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const role = localStorage.getItem("role") as "admin" | "player" | null;
    const instrument = localStorage.getItem("instrument");

    if (accessToken && refreshToken && role && instrument) {
      setAuth({
        accessToken,
        refreshToken,
        role,
        instrument,
        isLoggedIn: true,
      });
    }
  }, []);

  const login = (data: Partial<AuthState>) => {
    if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken)
      localStorage.setItem("refreshToken", data.refreshToken);
    if (data.role) localStorage.setItem("role", data.role);
    if (data.instrument) localStorage.setItem("instrument", data.instrument);

    setAuth({
      accessToken: data.accessToken || null,
      refreshToken: data.refreshToken || null,
      role: data.role || null,
      instrument: data.instrument || null,
      isLoggedIn: true,
    });
  };

  const logout = () => {
    localStorage.clear();
    setAuth(defaultState);
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
