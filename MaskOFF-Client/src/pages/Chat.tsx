import React, { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import useChats from "@/hooks/useChats";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Textarea } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { GlobalConfigContext } from "@/config/GlobalConfig";

const Chat = () => {
  const { chatID } = useParams<{ chatID: string }>();
  const {user} = useContext(GlobalConfigContext);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const handleRefresh = () =>{
    setRefreshTrigger(!refreshTrigger);
  }
  const {
    chats,
    selectedChat,
    messages,
    loading,
    error,
    fetchChats,
    selectChatByID,
    sendChatMessage,
    removeChat,
  } = useChats();

  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    fetchChats();
    if (chatID) {
      selectChatByID(chatID);
    }
    console.log(selectedChat);
  }, [chatID,refreshTrigger]);

  const handleSendMessage = async () => {
    if (selectedChat && newMessage.trim()) {
      await sendChatMessage(selectedChat.chatID, newMessage.trim());
      setNewMessage("");
      handleRefresh();
    }
  };

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-4">
        {/* Sidebar: List of Chats */}
        <div className="w-full md:w-1/3 border-r pr-2">
          <h2 className="text-xl font-bold mb-2">Chats</h2>
          {loading && chats.length === 0 ? (
            <Spinner size="sm" />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ul>
              {chats.map((chat) => (
                <Button
                  key={chat.chatID}
                  className={`p-2 border-b cursor-pointer ${
                    selectedChat?.chatID === chat.chatID ? "bg-gray-200" : ""
                  }`}
                  onPress={() => selectChatByID(chat.chatID)}
                >
                  <p>{chat.participants.join(", ")}</p>
                </Button>
              ))}
            </ul>
          )}
        </div>
        {/* Main Chat Panel */}
        <div className="w-full md:w-2/3">
          {selectedChat ? (
            <>
              <Card className="mb-4">
                <CardHeader>
                  <h2 className="text-xl font-bold">
                    Chat with: {selectedChat.participants.filter((participant)=>participant.userID === user.userID).username}
                  </h2>
                </CardHeader>
                <CardBody className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <Spinner size="sm" />
                  ) : messages.length > 0 ? (
                    messages.map((msg) => (
                      <div key={msg.msgID} className="p-2 border-b">
                        <p>
                          <strong>{msg.sender}:</strong> {msg.message}
                        </p>
                        <small>{new Date(msg.timestamp).toLocaleString()}</small>
                      </div>
                    ))
                  ) : (
                    <p>No messages yet.</p>
                  )}
                </CardBody>
                <CardFooter className="flex items-center gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow"
                  />
                  <Button onPress={handleSendMessage}>Send</Button>
                </CardFooter>
              </Card>
              <Button variant="ghost" onPress={() => removeChat(selectedChat.chatID)}>
                Delete Chat
              </Button>
            </>
          ) : (
            <p>Select a chat from the list to view messages.</p>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Chat;
