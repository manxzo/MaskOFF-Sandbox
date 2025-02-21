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
import { GlobalConfigContext } from "@/config/GlobalConfig"; // if using a global context

export const useUser = ()=> {
  const globalContext = useContext(GlobalConfigContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: {
    name: string;
    dob: Date;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    anonymousIdentity: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(data);
      return res.data;
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
      setError(err.message || "Verification failed");
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
      setError(err.message || "Forgot password failed");
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
      setError(err.message || "Reset password failed");
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
      if (globalContext) {
        globalContext.setUser(res.data.user);
      }
      localStorage.setItem("token", res.data.token);
      return res.data;
    } catch (err: any) {
      setError(err.message || "Login failed");
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
      if (globalContext) {
        globalContext.setUser(res.data);
      }
      return res.data;
    } catch (err: any) {
      setError(err.message || "Fetch user failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const doLogout = () => {
    logout();
    if (globalContext) {
      globalContext.setUser(null);
    }
  };

  return {
    user: globalContext?.user,
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
