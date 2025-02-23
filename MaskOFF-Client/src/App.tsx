// app.tsx
import { Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
import { EmailVerification } from "./pages/EmailVerification";
import { ResetPasswordForm } from "./pages/PasswordReset";
import useWebSocketUpdates from "./hooks/useWebSocket";
import FriendsPage from "./pages/Friends";
import Posts from "./pages/Posts";  
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { GlobalConfigContext } from "./config/GlobalConfig";

const App = () => {
  const { user } = useContext(GlobalConfigContext);
  useWebSocketUpdates(user);
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/profile/:username?" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default App;
