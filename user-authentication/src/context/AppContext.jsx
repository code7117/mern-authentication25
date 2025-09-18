import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

// ✅ Axios default configuration
axios.defaults.withCredentials = true;

export const AppContextProvider = ({ children }) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
  console.log("Backend URL:", backendUrl);

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  // ---------------- FETCH USER DATA ----------------
  const getUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/data`);
      console.log("User data response:", response.data);

      if (response.data.status && response.data.data) {
        setUserData(response.data.data);
        setIsLoggedin(true);
      } else {
        setUserData(null);
        setIsLoggedin(false);
        toast.error(response.data.message || "Failed to fetch user data.");
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
      const response = await axios.get(`${backendUrl}/api/auth/is-auth`);
      console.log("Auth state response:", response.data);

      if (response.data.status) {
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
