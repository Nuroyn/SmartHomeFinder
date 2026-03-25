import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const UserContext = createContext(null);

function loadInitialState() {
  try {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const isLoggedIn = !!(token && user);
    return { user, token, isLoggedIn };
  } catch {
    return { user: null, token: null, isLoggedIn: false };
  }
}

export function UserProvider({ children }) {
  const [state, setState] = useState(loadInitialState);

  // Keep localStorage in sync whenever state changes
  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem("token", state.token);
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
    }
  }, [state.token, state.user]);

  const login = useCallback((user, token) => {
    setState({ user, token, isLoggedIn: true });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isLoggedIn: false });
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const merged = { ...prev.user, ...updatedFields };
      return { ...prev, user: merged };
    });
  }, []);

  return (
    <UserContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useAuth must be used within a UserProvider");
  return ctx;
}

export default UserContext;
