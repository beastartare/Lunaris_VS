import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./lib/components/login";
import Register from "./lib/components/register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
