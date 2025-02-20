// src/contexts/GlobalConfigContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";

// Define interfaces for global state.
export interface User {
  userID: string;
  username: string;
  firstName: string;
  lastName: string;
  publicInfo?: any;
  anonymousInfo?: any;
}

export interface Message {
  msgID: string;
  sender: string;
  recipient: string;
  message: string;
  timestamp: string;
}

export interface Chat {
  chatID: string;
  participants: string[];
  messages: Message[];
}

export interface Friend {
  userID: string;
  username: string;
}

export interface GlobalConfig {
  user: User | null;
  chats: Chat[];
  friends: Friend[];
  friendRequestsSent: Friend[];
  friendRequestsReceived: Friend[];
}

export interface GlobalConfigContextType extends GlobalConfig {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
  setFriendRequestsSent: React.Dispatch<React.SetStateAction<Friend[]>>;
  setFriendRequestsReceived: React.Dispatch<React.SetStateAction<Friend[]>>;
}

export const GlobalConfigContext = createContext<
  GlobalConfigContextType | undefined
>(undefined);

interface GlobalConfigProviderProps {
  children: ReactNode;
}

export const GlobalConfigProvider: React.FC<GlobalConfigProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState<Friend[]>([]);
  const [friendRequestsReceived, setFriendRequestsReceived] = useState<
    Friend[]
  >([]);

  useEffect(() => {
    // Setup WebSocket connection
    const ws = new WebSocket(
      process.env.REACT_APP_WS_URL || "ws://localhost:3000"
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
      if (user) {
        ws.send(JSON.stringify({ type: "AUTH", userID: user.userID }));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);
      // Handle different update types, e.g., update chats, friends, etc.
      // You might trigger a refresh of data here.
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [user]);

  const contextValue: GlobalConfigContextType = {
    user,
    chats,
    friends,
    friendRequestsSent,
    friendRequestsReceived,
    setUser,
    setChats,
    setFriends,
    setFriendRequestsSent,
    setFriendRequestsReceived,
  };

  return (
    <GlobalConfigContext.Provider value={contextValue}>
      {children}
    </GlobalConfigContext.Provider>
  );
};
