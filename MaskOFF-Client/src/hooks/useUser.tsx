// src/hooks/useUser.ts
import { useContext, useState } from "react";
import { GlobalConfigContext } from "@/config/GlobalConfig";
import { getUser, loginUser } from "../services/services";

export const useUser = () => {
  const context = useContext(GlobalConfigContext);
  if (!context) throw new Error("useUser must be used within a GlobalConfigProvider");
  const { user, setUser } = context;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (userID: string) => {
    setLoading(true);
    try {
      const res = await getUser(userID);
      setUser(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await loginUser(username, password);
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, fetchUser, login };
};
