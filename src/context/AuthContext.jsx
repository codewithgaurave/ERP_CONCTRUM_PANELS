// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Get user and token from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("hrms-user");
    const savedToken = localStorage.getItem("hrms-token");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedToken) {
      setToken(savedToken);
    }
    
    setLoading(false);
  }, []);

  // 🔹 Set login data (called from Login component after API success)
  const setLoginData = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("hrms-user", JSON.stringify(userData));
    localStorage.setItem("hrms-token", authToken);
  };

  // 🔹 Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("hrms-user");
    localStorage.removeItem("hrms-token");
  };

  // 🔹 Check if user is logged in
  const isLoggedIn = !!(user && token);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        token, 
        setLoginData, 
        logout, 
        isLoggedIn, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);