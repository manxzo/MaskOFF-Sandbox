// src/App.tsx

import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";

// Import your pages (ensure you create/update these pages using @heroui/react components)

const App = () => {




  return (
    <Routes>
      {<Route path="/home" element={<Home/>}/>}
    </Routes>
  );
};

export default App;
