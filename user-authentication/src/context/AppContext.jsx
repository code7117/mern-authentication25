import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
  console.log("Backend URL:", backendUrl);

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  // ---------------- FETCH USER DATA ----------------
  const getUserData = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/user/data`, {
        method: "GET",
        credentials: "include", // ✅ send cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("User data response:", data);

      if (data.status && data.data) {
        setUserData(data.data);
        setIsLoggedin(true);
      } else {
        setUserData(null);
        setIsLoggedin(false);
        toast.error(data.message || "Failed to fetch user data.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserData(null);
      setIsLoggedin(false);
      toast.error("Failed to fetch user data.");
    }
  };

  // ---------------- CHECK AUTH STATE ----------------
  const getAuthState = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/is-auth`, {
        method: "GET",
        credentials: "include", // ✅ send cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("Auth state response:", data);

      if (data.status) {
        await getUserData();
      } else {
        setUserData(null);
        setIsLoggedin(false);
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setUserData(null);
      setIsLoggedin(false);
    }
  };

  // Check auth on app load
  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
