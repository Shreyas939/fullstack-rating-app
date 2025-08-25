import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const at = localStorage.getItem("accessToken");
      const rt = localStorage.getItem("refreshToken");
      if (storedUser && at) {
        setUser(JSON.parse(storedUser));
        setAccessToken(at);
        setRefreshToken(rt || null);
      }
    } catch {
      // ignore errors reading storage
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && accessToken) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, [user, accessToken, refreshToken]);

  const login = (nextUser, at, rt) => {
    setUser(nextUser);
    setAccessToken(at);
    setRefreshToken(rt || null);
  };

  // logout function to clear state
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      login,
      logout,
      loading,
    }),
    [user, accessToken, refreshToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
