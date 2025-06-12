import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (authData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem("accessToken");
      const storedUserJson = sessionStorage.getItem("user");

      if (storedToken && storedUserJson) {
        const storedUser: User = JSON.parse(storedUserJson);
        setAccessToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse auth data from session storage", error);
      sessionStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (data: any) => {
    const userData: User = {
      _id: data.userId || data._id,
      name: data.name,
      email: data.email,
      instrument: data.instrument,
      role: data.role,
    };

    setUser(userData);
    setAccessToken(data.accessToken);

    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) {
      sessionStorage.setItem("refreshToken", data.refreshToken);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    sessionStorage.clear();
  };

  const value = {
    user,
    accessToken,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
