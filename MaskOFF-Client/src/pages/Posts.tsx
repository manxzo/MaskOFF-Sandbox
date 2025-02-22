import { useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Divider } from "@heroui/react";
import PostInput from "@/components/PostInput";
import PostList from "@/components/PostList";

const Posts = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DefaultLayout>
      <div>
        <PostInput onPostCreated={handlePostCreated} />
        <Divider />
        <PostList key={refreshTrigger} />
      </div>
    </DefaultLayout>
  );
};

export default Posts; 