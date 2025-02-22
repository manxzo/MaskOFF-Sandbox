// src/contexts/GlobalConfigContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";

export interface Friend {
  userID: string;
  username: string;
}

export interface UserProfile {
  profileID: string;
  user: string;
  privacy: boolean;
  publicInfo: {
    bio: string;
    skills: string[];
    achievements: string[];
    portfolio: string;
  };
  anonymousInfo: {
    anonymousIdentity: string;
    details: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  userID: string;
  name: string;
  dob: Date;
  email: string;
  username: string;
  emailVerified: boolean;
  friendRequestsSent: Friend[];
  friendRequestsReceived: Friend[];
  friends: Friend[];
  createdAt: string;
  updatedAt: string;
  profile: UserProfile;
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

export interface GlobalConfig {
  user: User | null;
  chats: Chat[];
  friends: Friend[];
  friendRequestsSent: Friend[];
  friendRequestsReceived: Friend[];
  error: string | null;
}

export interface GlobalConfigContextType extends GlobalConfig {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
  setFriendRequestsSent: React.Dispatch<React.SetStateAction<Friend[]>>;
  setFriendRequestsReceived: React.Dispatch<React.SetStateAction<Friend[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);

interface GlobalConfigProviderProps {
  children: ReactNode;
}

export const GlobalConfigProvider: React.FC<GlobalConfigProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState<Friend[]>([]);
  const [friendRequestsReceived, setFriendRequestsReceived] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Setup WebSocket connection
    const ws = new WebSocket(import.meta.env.VITE_NETWORK_API_URL || "ws://localhost:3000");

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
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
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
    error,
    setError,
  };

  return (
    <GlobalConfigContext.Provider value={contextValue}>
      {children}
    </GlobalConfigContext.Provider>
  );
};
