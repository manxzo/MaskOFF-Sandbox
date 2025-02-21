// src/App.tsx

import { Route, Routes, useParams, Navigate } from "react-router-dom";
import Home from "./pages/Home";

// Import your pages (ensure you create/update these pages using @heroui/react components)

const App = () => {
  const { username } = useParams();
  //For authenticated pages use <Route path={`/${username}/path`} element = {<Element/>}/>
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

export default App;
