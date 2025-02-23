// src/pages/FriendPage.tsx
import React, { useState, useEffect, useContext } from "react";
import { listUsers } from "@/services/services";
import useFriends from "@/hooks/useFriends";
import { GlobalConfigContext, Friend } from "@/config/GlobalConfig";
import DefaultLayout from "../layouts/default";
import { Tabs,Tab,Card,CardBody,CardFooter,Link,User,Button } from "@heroui/react";
import {HeartFilledIcon,DeleteIcon} from '../components/icons'
const FriendPage: React.FC = () => {
  const globalContext = useContext(GlobalConfigContext);
  if (!globalContext) {
    throw new Error("FriendPage must be used within a GlobalConfigProvider");
  }
  const { user, friends, friendRequestsSent, friendRequestsReceived } = globalContext;
  const { sendRequest, acceptRequest, rejectRequest } = useFriends();

  const [allUsers, setAllUsers] = useState<Friend[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);



  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await listUsers();
  
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
  const filteredFriends = allUsers.filter((friend) => {
    if (!user) return false;
    if (friend.userID === user.userID) return false;
    const alreadySent = friendRequestsSent.some((fr) => fr.userID === friend.userID);
    const alreadyReceived = friendRequestsReceived.some((fr) => fr.userID === friend.userID);
    const alreadyFriend = friends.some((fr) => fr.userID === friend.userID);
    return !alreadySent && !alreadyReceived && !alreadyFriend;
  });

  return (
    <DefaultLayout>
           
      <Tabs aria-label="Friends">
        <Tab key="Find Users" title="Find Users" >
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : filteredFriends.length === 0 ? (
              <p>No New users found.</p>
            ) : (
                <div className="grid grid-cols-4">
                   {filteredFriends.map((user) => (
                <Card key={user.userID}>
            <CardBody className="flex-row">
            <User
                avatarProps={{
                  src: user.avatar,
                  name: user.name.charAt(0),
                  showFallback:true,
                }}
                description={
                  <Link href={`/profile/${user.username}`} size="sm">
                    @{user.username}
                  </Link>
                }
                name={user.name}
                className="flex-grow"
              />
              <Button onPress={()=>sendRequest(user.userID)} color="danger" isIconOnly className="flex-shrink"><HeartFilledIcon/></Button>
            </CardBody>
          </Card>
                
              ))}
             
                </div>
            )}
          
        </Tab>
        <Tab key="Friend Requests Recieved" title="Friend Requests Recieved" className="grid-cols-3">
        {friendRequestsReceived.length === 0 ? (
              <p>No friend requests received.</p>
            ) : (
              friendRequestsReceived.map((user) => (
                <Card key={user.userID}>
            <CardBody>
            <User
                avatarProps={{
                  src: user.avatar,
                  name: user.name.charAt(0),
                  showFallback:true,
                }}
                description={
                  <Link href={`/user/profile/${user.username}`} size="sm">
                    @{user.username}
                  </Link>
                }
                name={user.name}
              />
            </CardBody>
            <CardFooter>
            <Button onPress={()=>acceptRequest(user.userID)} color="danger" isIconOnly><HeartFilledIcon/></Button>
            <Button onPress={()=>rejectRequest(user.userID)} color="danger" isIconOnly><DeleteIcon/></Button>
            </CardFooter>
          </Card>
              ))
            )}
        </Tab>
        <Tab key="Friend Requests Sent" title="Friend Requests Sent" className="grid-cols-3">
        {friendRequestsReceived.length === 0 ? (
              <p>No friend requests received.</p>
            ) : (
              friendRequestsReceived.map((user) => (
                <Card key={user.userID}>
            <CardBody>
            <User
                avatarProps={{
                  src: user.avatar,
                  name: user.name.charAt(0),
                  showFallback:true,
                }}
                description={
                  <Link href={`/user/profile/${user.username}`} size="sm">
                    @{user.username}
                  </Link>
                }
                name={user.name}
              />
            </CardBody>
            <CardFooter>
                <pre>Pending Accept...</pre>
            </CardFooter>
          </Card>
              ))
            )}
        </Tab>
        <Tab key="Friends" title="Friends" className="grid-cols-3">
        {friends.length === 0 ? (
              <p>You have no friends yet.</p>
            ) : (
              friends.map((user) => (
                <Card key={user.userID}>
                <CardBody>
                <User
                    avatarProps={{
                      src: user.avatar,
                      name: user.name.charAt(0),
                      showFallback:true,
                    }}
                    description={
                      <Link href={`/user/profile/${user.username}`} size="sm">
                        @{user.username}
                      </Link>
                    }
                    name={user.name}
                  />
                </CardBody>
                <CardFooter>
                    <Button>Message</Button>
                </CardFooter>
              </Card>
              ))
            )}
        </Tab>
      </Tabs>
    </DefaultLayout>
   
  );
};

export default FriendPage;
