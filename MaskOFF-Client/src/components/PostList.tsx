import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/react";
import { Chip } from "@heroui/react";
import { addToast } from "@heroui/toast";

interface BasePost {
  _id: string;
  title: string;
  description: string;
  author: {
    username: string;
  };
  createdAt: string;
  type: "Job" | "Service";
}

interface JobPost extends BasePost {
  type: "Job";
  price: number;
  contractPeriod: number;
}

interface ServicePost extends BasePost {
  type: "Service";
  fromPrice: number;
}

type Post = JobPost | ServicePost;

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch posts",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (posts.length === 0) {
    return <div>No posts available</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <Card key={post._id}>
          <CardBody>
            <div>
              <div>
                <Chip size="sm" variant="flat">{post.type}</Chip>
                <h3>{post.title}</h3>
                <p>
                  Posted by{" "}
                  <span>
                    {post.author.username}
                  </span>
                </p>
                <p>
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p>{post.description}</p>
            {post.type === "Job" ? (
              <div>
                <p>Price: ${post.price}</p>
                <p>Contract Period: {post.contractPeriod} days</p>
              </div>
            ) : (
              <div>
                <p>Starting from: ${post.fromPrice}</p>
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default PostList; 