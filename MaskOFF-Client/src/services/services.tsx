import axios from "axios";
import { addToast } from "@heroui/toast";

// base URL from env (REACT_APP_API_BASE_URL)
const API_BASE_URL =
   "http://localhost:3000/api";

// axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// req interceptor to attach JWT token to every request if avail
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

// register new user
export const registerUser = (data: {
  name: string;
  dob: Date;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  anonymousIdentity: string;
}) => apiClient.post("/register", data);

// verify email
export const verifyEmail = (userID: string, token: string) =>
  apiClient.get("/verify-email", { params: { userID, token } });

// request forgot password
export const forgotPassword = (email: string) =>
  apiClient.post("/forgot-password", { email });

// reset password
export const resetPassword = (data: {
  userID: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}) => apiClient.post("/reset-password", data);

// login user
export const loginUser = (username: string, password: string) =>
  apiClient.post("/users/login", { username, password });

// get user details
export const getUser = (userID: string) => apiClient.get(`/user/${userID}`);

// update user profile
export const updateProfile = (
  userID: string,
  data: { publicInfo?: any; anonymousInfo?: any }
) => apiClient.put(`/profile/${userID}`, data);
// update user Avatar
export const uploadAvatar = (avatar: File) => {
  const formData = new FormData();
  formData.append("avatar", avatar);
  return apiClient.post("/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// list all users (public info)
export const listUsers = () => apiClient.get("/users");

// ===== Post Endpoints =====
export const createPost = (data: {
  content: string;
  tags?: string[];
  isAnonymous?: boolean;
}) => apiClient.post("/posts", data);

export const getPosts = () => apiClient.get("/posts");

export const getPost = (postID: string) => apiClient.get(`/posts/${postID}`);

export const updatePost = (
  postID: string,
  data: { content?: string; tags?: string[]; isAnonymous?: boolean }
) => apiClient.put(`/posts/${postID}`, data);

export const deletePost = (postID: string) => apiClient.delete(`/posts/${postID}`);


export const addComment = (postID: string, data: { content: string; isAnonymous?: boolean }) =>
  apiClient.post(`/posts/${postID}/comments`, data);

export const upvotePost = (postID: string) => apiClient.post(`/posts/${postID}/upvote`);

export const downvotePost = (postID: string) => apiClient.post(`/posts/${postID}/downvote`);

// ===== Friend Endpoints =====

// send friend request
export const sendFriendRequest = (friendID: string) =>
  apiClient.post("/friends/request", { friendID });

// get friend requests received
export const getFriendRequestsReceived = () =>
  apiClient.get("/friends/requests/received");

// get friend requests sent
export const getFriendRequestsSent = () =>
  apiClient.get("/friends/requests/sent");

// accept friend request
export const acceptFriendRequest = (friendID: string) =>
  apiClient.post("/friends/accept", { friendID });

// reject friend request
export const rejectFriendRequest = (friendID: string) =>
  apiClient.post("/friends/reject", { friendID });

// get friends list
export const getFriends = () => apiClient.get("/friends");

// ===== Chat Endpoints =====

// create new chat
export const createChat = (recipientID: string) =>
  apiClient.post("/chat/create", { recipientID });

// list chats
export const listChats = () => apiClient.get("/chats");

// send message in chat
export const sendMessage = (recipientID: string, text: string) =>
  apiClient.post("/chat/send", { recipientID, text });

// get messages for 1 chat
export const getMessages = (chatID: string) =>
  apiClient.get(`/chat/messages/${chatID}`);

// delete message from 1 chat
export const deleteMessage = (chatID: string, messageID: string) =>
  apiClient.delete(`/chat/message/${chatID}/${messageID}`);

// edit message in 1 chat
export const editMessage = (
  chatID: string,
  messageID: string,
  newText: string
) => apiClient.put(`/chat/message/${chatID}/${messageID}`, { newText });

// delete entire chat
export const deleteChat = (chatID: string) =>
  apiClient.delete(`/chat/${chatID}`);

// ===== Job Endpoints =====
export const getJobs = () => apiClient.get("/jobs");
export const getJob = (jobID: string) => apiClient.get(`/jobs/${jobID}`);
export const createJob = (data: any) => apiClient.post("/jobs", data);
export const updateJob = (jobID: string, data: any) => apiClient.put(`/jobs/${jobID}`, data);
export const deleteJob = (jobID: string) => apiClient.delete(`/jobs/${jobID}`);

// ===== Apply to Job Endpoints =====
export const applyToJob = (jobID: string, message?: string) => 
  apiClient.post(`/jobs/${jobID}/apply`, { message });

export const getJobApplications = (jobID: string) =>
  apiClient.get(`/jobs/${jobID}/applications`);

export const updateApplicationStatus = (jobID: string, applicationID: string, status: 'accepted' | 'rejected') =>
  apiClient.put(`/jobs/${jobID}/applications/${applicationID}`, { status });

// export all services as default for easier import
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
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
