// src/hooks/useChats.ts
import { useContext, useState } from "react";
import { GlobalConfigContext } from "@/config/GlobalConfig";
import { listChats, getMessages, sendMessage } from "../services/services";

export const useChats = () => {
  const context = useContext(GlobalConfigContext);
  if (!context) throw new Error("useChats must be used within a GlobalConfigProvider");
  const { chats, setChats } = context;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await listChats();
      setChats(res.data.chats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatID: string) => {
    try {
      const res = await getMessages(chatID);
      setChats(prev =>
        prev.map(chat => chat.chatID === chatID ? { ...chat, messages: res.data.messages } : chat)
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendChatMessage = async (recipientID: string, text: string) => {
    try {
      const res = await sendMessage(recipientID, text);
      fetchChats();
      return res.data.chat;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { chats, loading, error, fetchChats, fetchMessages, sendChatMessage };
};
