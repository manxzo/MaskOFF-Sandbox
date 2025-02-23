import { useState } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { title } from "@/components/primitives";

interface PostInputProps {
  onPostCreated: () => void;
}

// Two types of posts we can create
type PostType = "Job" | "Service";

// Common fields that both post types share
interface BasePost {
  title: string;
  description: string;
}

// Job posts need price and contract period (in days)
interface JobPost extends BasePost {
  type: "Job";
  price: number;
  contractPeriod: number;
}

// Service posts just need a minimum price
interface ServicePost extends BasePost {
  type: "Service";
  fromPrice: number;
}

const PostInput = ({ onPostCreated }: PostInputProps) => {
  // Start with Job post type by default
  const [postType, setPostType] = useState<PostType>("Job");

  // Initialize form with empty values but set type as Job
  const [newPost, setNewPost] = useState<Partial<JobPost | ServicePost>>({
    type: "Job",
    title: "",
    description: "",
    price: 0,
    contractPeriod: 0,
    // Don't need fromPrice for Job posts
    fromPrice: undefined
  });
  const [loading, setLoading] = useState(false);

  // When user changes post type, reset the form with appropriate fields
  const handlePostTypeChange = (value: PostType) => {
    setPostType(value);
    setNewPost({
      ...newPost,
      type: value,
      // If Job: set job fields, clear service fields
      // If Service: set service fields, clear job fields
      ...(value === "Job" 
        ? { price: 0, contractPeriod: 0, fromPrice: undefined }
        : { fromPrice: 0, price: undefined, contractPeriod: undefined }
      )
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(newPost)
      });

      if (!response.ok) throw new Error("Failed to create post");

      // Reset form back to Job post (our default)
      setNewPost({
        type: "Job",
        title: "",
        description: "",
        price: 0,
        contractPeriod: 0,
        fromPrice: undefined
      });
      
      addToast({
        title: "Success",
        description: "Post created successfully!",
        color: "success"
      });

      onPostCreated();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to create post",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h4 className={title({ size: "sm" })}>Create New Post</h4>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardBody>
          {/* Post type selector - defaults to Job */}
          <Select 
            label="Post Type"
            defaultSelectedKeys={["Job"]}
            value={postType}
            onChange={(e) => handlePostTypeChange(e.target.value as PostType)}
          >
            <SelectItem key="Job" value="Job">Job Post</SelectItem>
            <SelectItem key="Service" value="Service">Service Post</SelectItem>
          </Select>

          {/* Common fields for both post types */}
          <Input
            label="Title"
            placeholder="Enter title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter description"
            value={newPost.description}
            onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
            required
          />

          {/* Show different fields based on post type */}
          {postType === "Job" ? (
            <>
              {/* Job post specific fields */}
              <Input
                type="number"
                label="Price"
                placeholder="Enter price"
                value={newPost.price}
                onChange={(e) => setNewPost({ ...newPost, price: parseFloat(e.target.value) })}
                required
              />
              <Input
                type="number"
                label="Contract Period (days)"
                placeholder="Enter number of days"
                min="1"
                value={(newPost as JobPost).contractPeriod}
                onChange={(e) => setNewPost({ ...newPost, contractPeriod: parseInt(e.target.value) })}
                required
              />
            </>
          ) : (
            // Service post specific field
            <Input
              type="number"
              label="Minimum Price"
              placeholder="Enter minimum price"
              value={(newPost as ServicePost).fromPrice}
              onChange={(e) => setNewPost({ ...newPost, fromPrice: parseFloat(e.target.value) })}
              required
            />
          )}
        </CardBody>
        <CardFooter>
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
          >
            Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PostInput; 