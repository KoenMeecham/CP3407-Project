import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

const defaultGuestUser = {
  isLoggedIn: false,
  user_id: null,
  firstName: "Guest",
  lastName: "",
  name: "Guest",
  email: "",
  role: "customer",
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("feedme_user");
    return saved ? JSON.parse(saved) : defaultGuestUser;
  });

  useEffect(() => {
    localStorage.setItem("feedme_user", JSON.stringify(user));
  }, [user]);

  function login(userData) {
    const firstName = userData.f_name || userData.firstName || "";
    const lastName = userData.l_name || userData.lastName || "";

    setUser({
      isLoggedIn: true,
      user_id: userData.user_id || null,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim() || "User",
      email: userData.email || "",
      role: userData.role || "customer",
    });
  }

  function continueAsGuest() {
    setUser(defaultGuestUser);
  }

  function logout() {
    localStorage.removeItem("feedme_user");
    localStorage.removeItem("feedme_guest_email");
    setUser(defaultGuestUser);
}

  return (
    <UserContext.Provider value={{ user, login, logout, continueAsGuest }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
