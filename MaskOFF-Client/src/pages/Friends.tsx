// src/pages/FriendPage.tsx
import React, { useState, useEffect, useContext } from "react";
import { listUsers } from "@/services/services";
import useFriends from "@/hooks/useFriends";
import { GlobalConfigContext, Friend } from "@/config/GlobalConfig";
import DefaultLayout from "../layouts/default"
const FriendPage: React.FC = () => {
  const globalContext = useContext(GlobalConfigContext);
  if (!globalContext) {
    throw new Error("FriendPage must be used within a GlobalConfigProvider");
  }
  const { user, friends, friendRequestsSent, friendRequestsReceived } = globalContext;
  const { sendRequest, acceptRequest, rejectRequest } = useFriends();

  const [allUsers, setAllUsers] = useState<Friend[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"findUsers" | "requestsReceived" | "requestsSent" | "friends">("findUsers");

  // Fetch all users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await listUsers();
        // Expecting res.data.users as an array of { userID, username }
        setAllUsers(res.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter out the logged-in user and any user already in a friend relationship or pending request.
  const potentialFriends = allUsers.filter((candidate) => {
    if (!user) return false;
    if (candidate.userID === user.userID) return false;
    const alreadySent = friendRequestsSent.some((fr) => fr.userID === candidate.userID);
    const alreadyReceived = friendRequestsReceived.some((fr) => fr.userID === candidate.userID);
    const alreadyFriend = friends.some((fr) => fr.userID === candidate.userID);
    return !alreadySent && !alreadyReceived && !alreadyFriend;
  });

  return (
    <DefaultLayout>
         <div style={{ padding: "1rem" }}>
      <h1>Friends</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setActiveTab("findUsers")}>Find Users</button>
        <button onClick={() => setActiveTab("requestsReceived")}>Requests Received</button>
        <button onClick={() => setActiveTab("requestsSent")}>Requests Sent</button>
        <button onClick={() => setActiveTab("friends")}>Friends</button>
      </div>

      <div>
        {activeTab === "findUsers" && (
          <div>
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : potentialFriends.length === 0 ? (
              <p>No potential friends found.</p>
            ) : (
              potentialFriends.map((candidate) => (
                <div key={candidate.userID} style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem" }}>
                  <p>{candidate.username}</p>
                  <button onClick={() => sendRequest(candidate.userID)}>Add Friend</button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "requestsReceived" && (
          <div>
            {friendRequestsReceived.length === 0 ? (
              <p>No friend requests received.</p>
            ) : (
              friendRequestsReceived.map((req) => (
                <div key={req.userID} style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem" }}>
                  <p>{req.username}</p>
                  <div>
                    <button onClick={() => acceptRequest(req.userID)}>Accept</button>
                    <button onClick={() => rejectRequest(req.userID)}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "requestsSent" && (
          <div>
            {friendRequestsSent.length === 0 ? (
              <p>No friend requests sent.</p>
            ) : (
              friendRequestsSent.map((req) => (
                <div key={req.userID} style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem" }}>
                  <p>{req.username} - Request Sent</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "friends" && (
          <div>
            {friends.length === 0 ? (
              <p>You have no friends yet.</p>
            ) : (
              friends.map((friend) => (
                <div key={friend.userID} style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem" }}>
                  <p>{friend.username}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
    </DefaultLayout>
   
  );
};

export default FriendPage;
