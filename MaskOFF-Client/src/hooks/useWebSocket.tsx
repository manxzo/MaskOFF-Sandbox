// src/hooks/useWebSocketUpdates.tsx
import { useEffect, useContext } from "react";
import { GlobalConfigContext } from "../config/GlobalConfig";
import { 
  getFriends, 
  getFriendRequestsReceived, 
  getFriendRequestsSent, 
  listChats 
} from "../services/services";

export const useWebSocketUpdates = () => {
  const globalContext = useContext(GlobalConfigContext);
  if (!globalContext) {
    throw new Error("useWebSocketUpdates must be used within a GlobalConfigProvider");
  }
  const { user, setFriends, setFriendRequestsReceived, setFriendRequestsSent, setChats } = globalContext;

  useEffect(() => {
    // Only create the connection if a user is logged in
    if (!user) return;

    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Authenticate the connection with the logged in user's ID
      ws.send(JSON.stringify({ type: "AUTH", userID: user.userID }));
    };

    ws.onmessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        if (data.type === "UPDATE_DATA") {
          switch (data.update) {
            case "friends": {
              const res = await getFriends();
              setFriends(res.data.friends || []);
              break;
            }
            case "friendRequests": {
              const resReceived = await getFriendRequestsReceived();
              setFriendRequestsReceived(resReceived.data.friendRequestsReceived || []);
              const resSent = await getFriendRequestsSent();
              setFriendRequestsSent(resSent.data.friendRequestsSent || []);
              break;
            }
            case "chats": {
              const res = await listChats();
              setChats(res.data.chats || []);
              break;
            }
            default:
              console.warn("Unknown update type:", data.update);
          }
        }
      } catch (error) {
        console.error("Error handling websocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup: close the connection when the component unmounts or user changes.
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [user, setFriends, setFriendRequestsReceived, setFriendRequestsSent, setChats]);
};

export default useWebSocketUpdates;
