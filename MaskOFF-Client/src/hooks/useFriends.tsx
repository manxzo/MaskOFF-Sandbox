// src/hooks/useFriends.ts
import { useContext, useState } from "react";
import { GlobalConfigContext } from "@/config/GlobalConfig";
import { sendFriendRequest, getFriendRequestsReceived, getFriendRequestsSent, acceptFriendRequest, rejectFriendRequest, getFriends } from "../services/services";

export const useFriends = () => {
  const context = useContext(GlobalConfigContext);
  if (!context) throw new Error("useFriends must be used within a GlobalConfigProvider");
  const { friends, friendRequestsSent, friendRequestsReceived, setFriends, setFriendRequestsSent, setFriendRequestsReceived } = context;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await getFriends();
      setFriends(res.data.friends);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const resReceived = await getFriendRequestsReceived();
      setFriendRequestsReceived(resReceived.data.friendRequestsReceived);
      const resSent = await getFriendRequestsSent();
      setFriendRequestsSent(resSent.data.friendRequestsSent);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendRequest = async (friendID: string) => {
    try {
      await sendFriendRequest(friendID);
      await fetchFriendRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const acceptRequest = async (friendID: string) => {
    try {
      await acceptFriendRequest(friendID);
      await fetchFriends();
      await fetchFriendRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const rejectRequest = async (friendID: string) => {
    try {
      await rejectFriendRequest(friendID);
      await fetchFriendRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { friends, friendRequestsSent, friendRequestsReceived, loading, error, fetchFriends, fetchFriendRequests, sendRequest, acceptRequest, rejectRequest };
};
