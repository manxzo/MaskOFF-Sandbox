// src/hooks/useFriends.tsx
import { useState, useContext } from "react";
import {
  sendFriendRequest,
  getFriendRequestsReceived,
  getFriendRequestsSent,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
} from "@/services/services";
import { GlobalConfigContext } from "@/config/GlobalConfig";

export const useFriends = () => {
  const globalContext = useContext(GlobalConfigContext);
  if (!globalContext) {
    throw new Error("useFriends must be used within a GlobalConfigProvider");
  }
  const {
    setFriends,
    setFriendRequestsSent,
    setFriendRequestsReceived,
    error,
    setError,
  } = globalContext;
  const [loading, setLoading] = useState<boolean>(false);

  const sendRequest = async (friendID: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendFriendRequest(friendID);
      // Optionally, you can re-fetch friend requests after sending one.
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error || err.message || "Send friend request failed";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequestsReceived = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFriendRequestsReceived();
      setFriendRequestsReceived(res.data.friendRequestsReceived || []);
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Fetching friend requests received failed";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequestsSent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFriendRequestsSent();
      setFriendRequestsSent(res.data.friendRequestsSent || []);
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Fetching friend requests sent failed";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (friendID: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await acceptFriendRequest(friendID);
      // Refresh friends list and friend request lists after accepting
      const friendsRes = await getFriends();
      setFriends(friendsRes.data.friends || []);
      await fetchFriendRequestsReceived();
      await fetchFriendRequestsSent();
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Accept friend request failed";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (friendID: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await rejectFriendRequest(friendID);
      // Refresh friend request lists after rejection
      await fetchFriendRequestsReceived();
      await fetchFriendRequestsSent();
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Reject friend request failed";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFriends();
      setFriends(res.data.friends || []);
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error || err.message || "Fetching friends list failed";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendRequest,
    fetchFriendRequestsReceived,
    fetchFriendRequestsSent,
    acceptRequest,
    rejectRequest,
    fetchFriendsList,
  };
};

export default useFriends;
