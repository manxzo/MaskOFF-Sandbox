import React, { useState, useEffect, useContext } from "react";
import { listUsers, createChat } from "@/services/services";
import useFriends from "@/hooks/useFriends";
import { GlobalConfigContext, Friend } from "@/config/GlobalConfig";
import DefaultLayout from "../layouts/default";
import { Tabs, Tab, Card, CardBody, CardFooter, Link, User, Button } from "@heroui/react";
import { HeartFilledIcon, DeleteIcon } from "../components/icons";
import { useNavigate } from "react-router-dom";

const FriendPage: React.FC = () => {
  const globalContext = useContext(GlobalConfigContext);
  if (!globalContext) {
    throw new Error("FriendPage must be used within a GlobalConfigProvider");
  }
  const { user, friendRequestsSent, friendRequestsReceived } = globalContext;
  const { sendRequest, acceptRequest, rejectRequest } = useFriends();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState<Friend[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await listUsers();
        setAllUsers(res.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // filter out the logged-in user and any user already in a friend relation / pending request
  const filteredFriends = allUsers?.filter((friend) => {
    if (!user) return false;
    if (friend.userID === user.userID) return false;
    const alreadySent = friendRequestsSent?.some((fr) => fr.userID === friend.userID);
    const alreadyReceived = friendRequestsReceived?.some((fr) => fr.userID === friend.userID);
    const alreadyFriend = user.friends?.some((fr) => fr.userID === friend.userID);
    return !alreadySent && !alreadyReceived && !alreadyFriend;
  });

  const handleSendRequest = (friendID: string) => {
    sendRequest(friendID);
  };

  // updated: navigate to dynamic chat route "/chat/:chatID"
  const handleMessage = async (friendID: string) => {
    try {
      const res = await createChat(friendID);
      // assuming the response contains chatID in res.data.chatID
      navigate(`/chat/${res.data.chatID}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return (
    <DefaultLayout>
      <Tabs aria-label="Friends">
        <Tab key="findUsers" title="Find Users">
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : filteredFriends.length === 0 ? (
            <p>No new users found.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredFriends.map((friend) => (
                <Card key={friend.userID}>
                  <CardBody className="flex items-center justify-between">
                    <User
                      avatarProps={{
                        src: friend.avatar,
                        name: friend.name.charAt(0),
                        showFallback: true,
                      }}
                      description={
                        <Link href={`/profile/${friend.username}`} size="sm">
                          @{friend.username}
                        </Link>
                      }
                      name={friend.name}
                      className="flex-grow"
                    />
                    <Button onPress={() => handleSendRequest(friend.userID)} isIconOnly color="danger">
                      <HeartFilledIcon />
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </Tab>
        <Tab key="friendRequestsReceived" title="Friend Requests Received">
          {friendRequestsReceived?.length === 0 ? (
            <p>No friend requests received.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {friendRequestsReceived.map((fr) => (
                <Card key={fr.userID}>
                  <CardBody>
                    <User
                      avatarProps={{
                        src: fr.avatar,
                        name: fr.name.charAt(0),
                        showFallback: true,
                      }}
                      description={
                        <Link href={`/profile/${fr.username}`} size="sm">
                          @{fr.username}
                        </Link>
                      }
                      name={fr.name}
                    />
                  </CardBody>
                  <CardFooter className="flex justify-around">
                    <Button onPress={() => acceptRequest(fr.userID)} color="success" isIconOnly>
                      <HeartFilledIcon />
                    </Button>
                    <Button onPress={() => rejectRequest(fr.userID)} color="danger" isIconOnly>
                      <DeleteIcon />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </Tab>
        <Tab key="friendRequestsSent" title="Friend Requests Sent">
          {friendRequestsSent?.length === 0 ? (
            <p>No friend requests sent.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {friendRequestsSent.map((fr) => (
                <Card key={fr.userID}>
                  <CardBody>
                    <User
                      avatarProps={{
                        src: fr.avatar,
                        name: fr.name.charAt(0),
                        showFallback: true,
                      }}
                      description={
                        <Link href={`/profile/${fr.username}`} size="sm">
                          @{fr.username}
                        </Link>
                      }
                      name={fr.name}
                    />
                  </CardBody>
                  <CardFooter>
                    <p className="text-sm">Pending...</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </Tab>
        <Tab key="friends" title="Friends">
          {user?.friends?.length === 0 ? (
            <p>You have no friends yet.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {user?.friends?.map((friend) => (
                <Card key={friend?.userID}>
                  <CardBody>
                    <User
                      avatarProps={{
                        src: friend?.avatar,
                        name: friend?.name?.charAt(0),
                        showFallback: true,
                      }}
                      description={
                        <Link href={`/profile/${friend?.username}`} size="sm">
                          @{friend.username}
                        </Link>
                      }
                      name={friend.name}
                    />
                  </CardBody>
                  <CardFooter className="flex justify-around">
                    <Button onPress={() => handleMessage(friend?.userID)} color="primary">
                      Message
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </Tab>
      </Tabs>
    </DefaultLayout>
  );
};

export default FriendPage;
