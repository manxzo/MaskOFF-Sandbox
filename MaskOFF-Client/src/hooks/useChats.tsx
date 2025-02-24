import { useState } from "react";
import {
  createChat,
  listChats,
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
  deleteChat,
} from "@/services/services";


const useChats = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listChats();
      setChats(res.data.chats || res.data);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error fetching chats");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectChatByID = async (chatID: string) => {
    setLoading(true);
    setError(null);
    try {
      // find chat in state; if not, you might refetch all chats
      const chat = chats.find((c) => c.chatID === chatID);
      if (chat) {
        setSelectedChat(chat);
        // fetch messages for the selected chat
        const res = await getMessages(chatID);
        setMessages(res.data.messages || res.data);
        return chat;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error fetching chat messages");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async (chatID: string, text: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendMessage(chatID, text);
      // refresh messages after sending
      const updatedRes = await getMessages(chatID);
      setMessages(updatedRes.data.messages || updatedRes.data);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error sending message");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeChat = async (chatID: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteChat(chatID);
      setChats((prev) => prev.filter((chat) => chat.chatID !== chatID));
      if (selectedChat?.chatID === chatID) {
        setSelectedChat(null);
        setMessages([]);
      }
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error deleting chat");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // You can add removeMessage, updateChatMessage similarly if needed

  return {
    chats,
    selectedChat,
    messages,
    loading,
    error,
    fetchChats,
    selectChatByID,
    sendChatMessage,
    removeChat,
    setChats,
    setSelectedChat,
    setMessages,
    setError,
    setLoading,
  };
};

export default useChats;
