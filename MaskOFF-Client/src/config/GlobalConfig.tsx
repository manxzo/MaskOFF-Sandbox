// src/contexts/GlobalConfigContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getUser } from "@/services/services";
import { jwtDecode } from "jwt-decode";

export interface PublicProfile {
  userID: string;
  username: string;
  name: string;
  profile: {
    publicInfo?: {
      bio: string;
      skills: string[];
      achievements: string[];
      portfolio: string;
    };
  };
}

export interface Friend {
  userID: string;
  username: string;
  avatar: string;
  name: string;
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
  avatar?: string;
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
  participants: Friend[];
  messages: Message[];
}

export interface GlobalConfigContextType {
  user: User | null;
  chats: Chat[];
  friends: Friend[];
  friendRequestsSent: Friend[];
  friendRequestsReceived: Friend[];
  error: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
  setFriendRequestsSent: React.Dispatch<React.SetStateAction<Friend[]>>;
  setFriendRequestsReceived: React.Dispatch<React.SetStateAction<Friend[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);


interface JwtPayload {
  id: string;
  username: string;
  exp: number;
}

export const GlobalConfigProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState<Friend[]>([]);
  const [friendRequestsReceived, setFriendRequestsReceived] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          return;
        }
        getUser(decoded.id)
          .then((res) => {
            setUser(res.data);
          })
          .catch((err) => {
            console.error("Error reloading:", err);
            localStorage.removeItem("token");
          });
      } catch (err) {
        console.error("Error decoding token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const contextValue: GlobalConfigContextType = {
    user,
    chats,
    friends,
    friendRequestsSent,
    friendRequestsReceived,
    error,
    setUser,
    setChats,
    setFriends,
    setFriendRequestsSent,
    setFriendRequestsReceived,
    setError,
  };

  return (
    <GlobalConfigContext.Provider value={contextValue}>
      {children}
    </GlobalConfigContext.Provider>
  );
};
