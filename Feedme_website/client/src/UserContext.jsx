import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("feedme_token");
    const rawUser = localStorage.getItem("feedme_user");
    const savedUser = rawUser ? JSON.parse(rawUser) : null;

    if (token && savedUser) {
      setUser({ ...savedUser, token, isLoggedIn: true });
    }
  }, []);

  const login = (userData) => {
    setUser({ ...userData, isLoggedIn: true });
    localStorage.setItem("feedme_user", JSON.stringify(userData));
    localStorage.setItem("feedme_token", userData.token);
  };

  const logout = () => {
    localStorage.removeItem("feedme_token");
    localStorage.removeItem("feedme_user");
    localStorage.removeItem("feedme_guest_email");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);