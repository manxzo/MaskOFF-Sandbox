// src/App.tsx

import { Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
import { EmailVerification } from "./pages/EmailVerification";
import { ResetPasswordForm } from "./pages/PasswordReset";
import useWebSocketUpdates from "./hooks/useWebSocket";
import FriendsPage from "./pages/Friends";
import {GlobalConfigContext} from "./config/GlobalConfig"
// Import your pages (ensure you create/update these pages using @heroui/react components)

const App = () => {
  const { user } = useContext(GlobalConfigContext);
  useWebSocketUpdates(user);
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/reset-password" element={<ResetPasswordForm/>}/>
      <Route path={`/friends`} element={<FriendsPage/>}/>
    </Routes>
  );
};

export default App;
