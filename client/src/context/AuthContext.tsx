import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: "admin" | "player" | null;
  instrument: string | null;
  isLoggedIn: boolean;
  name: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: Partial<AuthState>) => void;
  logout: () => void;
}

const defaultState: AuthState = {
  userId: null,
  name: null,
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
    const name = localStorage.getItem("name");
    if (accessToken && name) {
      setAuth({
        userId: localStorage.getItem("userId"),
        name,
        accessToken,
        refreshToken: localStorage.getItem("refreshToken"),
        role: localStorage.getItem("role") as "admin" | "player" | null,
        instrument: localStorage.getItem("instrument"),
        isLoggedIn: true,
      });
    }
  }, []);

  const login = (data: Partial<AuthState>) => {
    if (data.name) localStorage.setItem("name", data.name);
    if (data.userId) localStorage.setItem("userId", data.userId);
    if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken)
      localStorage.setItem("refreshToken", data.refreshToken);
    if (data.role) localStorage.setItem("role", data.role);
    if (data.instrument) localStorage.setItem("instrument", data.instrument);

    setAuth({
      userId: data.userId || null,
      name: data.name || null,
      accessToken: data.accessToken || null,
      refreshToken: data.refreshToken || null,
      role: data.role || null,
      instrument: data.instrument || null,
      isLoggedIn: !!data.accessToken,
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
