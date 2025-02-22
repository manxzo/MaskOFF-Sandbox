// src/hooks/useUser.tsx
import { useState, useContext } from "react";
import {
  registerUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  loginUser,
  getUser,
  logout,
} from "@/services/services";
import { GlobalConfigContext } from "@/config/GlobalConfig";

export const useUser = () => {
  const globalContext = useContext(GlobalConfigContext);
  const{error,setError} =globalContext;
  const [loading, setLoading] = useState<boolean>(false);

  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(data);
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error || err.message || "Registration failed";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyUserEmail = async (userID: string, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyEmail(userID, token);
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error || err.message || "Verification failed";
      setError(errMsg);
     
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPwd = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPassword(email);
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error || err.message || "Forgot password failed";
      setError(errMsg);
     
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPwd = async (data: {
    userID: string;
    token: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await resetPassword(data);
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Reset password failed";
      setError(errMsg);
  
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(username, password);
    
      localStorage.setItem("token", res.data.token);
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error || err.message || "Login failed";
      setError(errMsg);
   
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (userID: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUser(userID);
  
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error || err.message || "Fetch user failed";
      setError(errMsg);
    
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const doLogout = () => {
    logout();
  };

  return {
    loading,
    error,
    register,
    verifyUserEmail,
    forgotPwd,
    resetPwd,
    login,
    fetchUser,
    logout: doLogout,
  };
};

export default useUser;
