import React, { useEffect, useState, useContext } from "react";
import DefaultLayout from "@/layouts/default";
import useChats from "@/hooks/useChats";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Textarea } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import { useParams } from "react-router-dom";
import { GlobalConfigContext } from "@/config/GlobalConfig";

const Chat = () => {
  const { chatID } = useParams<{ chatID: string }>();
  const { user } = useContext(GlobalConfigContext);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [newMessage, setNewMessage] = useState<string>("");

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

  useEffect(() => {
    fetchChats();
    if (chatID) {
      selectChatByID(chatID);
    }
  }, [chatID, refreshTrigger]);

  const handleSendMessage = async () => {
    if (selectedChat && newMessage.trim()) {
      await sendChatMessage(selectedChat.chatID, newMessage.trim());
      setNewMessage("");
      setRefreshTrigger(!refreshTrigger);
    }
  };

  // updated function to correctly confirm the other participant username
  const findOtherUsername = (chat: any) => {
    if (!chat || !chat.participants || !user) return "";
    const otherParticipant = chat.participants.find(
      (participant: any) => participant.userID !== user.userID
    );
    return otherParticipant ? otherParticipant.username : "";
  };

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-4">
        {/* sidebar: chat list */}
        <div className="w-full md:w-1/3 border-r pr-2">
          <h2 className="text-xl font-bold mb-2">Chats</h2>
          {loading ? (
            <Spinner size="sm" />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : chats.length === 0 ? (
            <p>No chats available.</p>
          ) : (
            <ul>
              {chats.map((chat: any) => (
                <li key={chat.chatID}>
                  <Button
                    className={`p-2 border-b cursor-pointer ${
                      selectedChat?.chatID === chat.chatID ? "bg-gray-200" : ""
                    }`}
                    onPress={() => selectChatByID(chat.chatID)}
                  >
                    <p>
                      {chat.participants &&
                        chat.participants
                          .map((participant: any) => participant.username)
                          .join(", ")}
                    </p>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* main chat panel */}
        <div className="w-full md:w-2/3">
          {selectedChat ? (
            <>
              <Card className="mb-4">
                <CardHeader>
                  <h2 className="text-xl font-bold">
                    Chat with: {findOtherUsername(selectedChat)}
                  </h2>
                </CardHeader>
                <CardBody className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <Spinner size="sm" />
                  ) : messages.length > 0 ? (
                    messages.map((msg: any) => (
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
