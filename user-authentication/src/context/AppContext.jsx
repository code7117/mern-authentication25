import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  // Fetch user data
  const getUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true, // 🔑 send cookies
      });

      const user = response.data?.data;

      if (response.data?.status && user) {
        setUserData(user);
        setIsLoggedin(true);
      } else {
        setUserData(null);
        setIsLoggedin(false);
        toast.error(response.data?.message || "Failed to fetch user data.");
      }
    } catch (err) {
      console.error("Error fetching userData:", err);
      setUserData(null);
      setIsLoggedin(false);
      toast.error("Failed to fetch user data.");
    }
  };

  // Check authentication
  const getAuthState = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true, // 🔑 send cookies
      });
      if (response.data?.status) {
        await getUserData();
      }
    } catch (err) {
      console.error("Auth check error:", err);
    }
  };

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
