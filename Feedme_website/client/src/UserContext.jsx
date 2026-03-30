import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("feedme_token");
    if (token) {
      // In a real app, you would verify the token with the backend here
      const savedUser = JSON.parse(localStorage.getItem("feedme_user"));
      if (savedUser) setUser({ ...savedUser, isLoggedIn: true });
    }
  }, []);

  const login = (userData) => {
    setUser({ ...userData, isLoggedIn: true });
    localStorage.setItem("feedme_user", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("feedme_token");
    localStorage.removeItem("feedme_user");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);