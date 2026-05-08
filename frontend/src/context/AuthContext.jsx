import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth.api.js";
import { setAccessToken, setOnAuthFail } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    setOnAuthFail(() => {
      setAccessToken(null);
      setUser(null);
    });

    (async () => {
      try {
        const { user: u, accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        setUser(u);
      } catch {
        setAccessToken(null);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      isAuthenticated: !!user,
      hasRole: (...roles) => !!user && roles.includes(user.role),
      async login(email, password) {
        const { user: u, accessToken } = await authApi.login({ email, password });
        setAccessToken(accessToken);
        setUser(u);
        return u;
      },
      async register(payload) {
        const { user: u, accessToken } = await authApi.register(payload);
        setAccessToken(accessToken);
        setUser(u);
        return u;
      },
      async logout() {
        try {
          await authApi.logout();
        } catch {
          // ignore network errors during logout
        }
        setAccessToken(null);
        setUser(null);
      },
      setUser,
    }),
    [user, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
