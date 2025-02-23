import axios from "axios";
import { addToast } from "@heroui/toast";

// Base URL from environment variable (REACT_APP_API_BASE_URL)
const API_BASE_URL =
   "http://localhost:3000/api";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token to every request if available.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.error || error.message || "An error occurred";
    addToast({
      title: "Error",
      description: errorMessage,
      color: "danger",
      size: "lg",
    });
    return Promise.reject(error);
  }
);
export const logout = () => {
  localStorage.removeItem("token");
};

// ===== User Endpoints =====

// Register a new user
export const registerUser = (data: {
  name: string;
  dob: Date;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  anonymousIdentity: string;
}) => apiClient.post("/register", data);

// Verify email
export const verifyEmail = (userID: string, token: string) =>
  apiClient.get("/verify-email", { params: { userID, token } });

// Request forgot password
export const forgotPassword = (email: string) =>
  apiClient.post("/forgot-password", { email });

// Reset password
export const resetPassword = (data: {
  userID: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}) => apiClient.post("/reset-password", data);

// Login user
export const loginUser = (username: string, password: string) =>
  apiClient.post("/users/login", { username, password });

// Get user details
export const getUser = (userID: string) => apiClient.get(`/user/${userID}`);

// Update user profile
export const updateProfile = (
  userID: string,
  data: { publicInfo?: any; anonymousInfo?: any }
) => apiClient.put(`/profile/${userID}`, data);
// Update user Avatar
export const uploadAvatar = (avatar: File) => {
  const formData = new FormData();
  formData.append("avatar", avatar);
  return apiClient.post("/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// List all users (public info)
export const listUsers = () => apiClient.get("/users");

// ===== Post Endpoints =====

// Create a new post
export const createPost = (data: {
  content: string;
  tags?: string[];
  isAnonymous?: boolean;
}) => apiClient.post("/posts", data);

// Get all posts
export const getPosts = () => apiClient.get("/posts");

// Get a single post by postID
export const getPost = (postID: string) => apiClient.get(`/posts/${postID}`);

// Update a post
export const updatePost = (
  postID: string,
  data: { content?: string; tags?: string[]; isAnonymous?: boolean }
) => apiClient.put(`/posts/${postID}`, data);

// Delete a post
export const deletePost = (postID: string) =>
  apiClient.delete(`/posts/${postID}`);

// Add a comment to a post
export const addComment = (postID: string, content: string) =>
  apiClient.post(`/posts/${postID}/comments`, { content });

// Upvote a post
export const upvotePost = (postID: string) =>
  apiClient.post(`/posts/${postID}/upvote`);

// Downvote a post
export const downvotePost = (postID: string) =>
  apiClient.post(`/posts/${postID}/downvote`);

// ===== Friend Endpoints =====

// Send friend request
export const sendFriendRequest = (friendID: string) =>
  apiClient.post("/friends/request", { friendID });

// Get friend requests received
export const getFriendRequestsReceived = () =>
  apiClient.get("/friends/requests/received");

// Get friend requests sent
export const getFriendRequestsSent = () =>
  apiClient.get("/friends/requests/sent");

// Accept friend request
export const acceptFriendRequest = (friendID: string) =>
  apiClient.post("/friends/accept", { friendID });

// Reject friend request
export const rejectFriendRequest = (friendID: string) =>
  apiClient.post("/friends/reject", { friendID });

// Get friends list
export const getFriends = () => apiClient.get("/friends");

// ===== Chat Endpoints =====

// Create a new chat
export const createChat = (recipientID: string) =>
  apiClient.post("/chat/create", { recipientID });

// List chats
export const listChats = () => apiClient.get("/chats");

// Send a message in a chat
export const sendMessage = (recipientID: string, text: string) =>
  apiClient.post("/chat/send", { recipientID, text });

// Get messages for a chat
export const getMessages = (chatID: string) =>
  apiClient.get(`/chat/messages/${chatID}`);

// Delete a message from a chat
export const deleteMessage = (chatID: string, messageID: string) =>
  apiClient.delete(`/chat/message/${chatID}/${messageID}`);

// Edit a message in a chat
export const editMessage = (
  chatID: string,
  messageID: string,
  newText: string
) => apiClient.put(`/chat/message/${chatID}/${messageID}`, { newText });

// Delete an entire chat
export const deleteChat = (chatID: string) =>
  apiClient.delete(`/chat/${chatID}`);

// Export all services as default for easier import.
export default {
  registerUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  loginUser,
  getUser,
  updateProfile,
  listUsers,
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  addComment,
  upvotePost,
  downvotePost,
  sendFriendRequest,
  getFriendRequestsReceived,
  getFriendRequestsSent,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  createChat,
  listChats,
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
  deleteChat,
};
