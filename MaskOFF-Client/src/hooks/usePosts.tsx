// src/hooks/usePosts.ts
import { useState } from "react";
import { createPost, getPosts, updatePost, deletePost, addComment, upvotePost, downvotePost } from "../services/services";

export const usePosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getPosts();
      setPosts(res.data.posts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewPost = async (data: { content: string; tags?: string[]; isAnonymous?: boolean }) => {
    try {
      const res = await createPost(data);
      fetchPosts();
      return res.data.post;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateExistingPost = async (postID: string, data: { content?: string; tags?: string[]; isAnonymous?: boolean }) => {
    try {
      const res = await updatePost(postID, data);
      fetchPosts();
      return res.data.post;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteExistingPost = async (postID: string) => {
    try {
      await deletePost(postID);
      fetchPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addPostComment = async (postID: string, content: string) => {
    try {
      const res = await addComment(postID, content);
      fetchPosts();
      return res.data.post;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const upvote = async (postID: string) => {
    try {
      const res = await upvotePost(postID);
      fetchPosts();
      return res.data.post;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const downvote = async (postID: string) => {
    try {
      const res = await downvotePost(postID);
      fetchPosts();
      return res.data.post;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { posts, loading, error, fetchPosts, createNewPost, updateExistingPost, deleteExistingPost, addPostComment, upvote, downvote };
};
