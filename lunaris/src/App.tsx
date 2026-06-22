import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./lib/components/login";
import Register from "./lib/components/register";
import Dashboard from "./lib/components/client/dashboard";
import Layoult from "./lib/components/client/layoult";
import Admin from "./lib/components/admin/home"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/client/dashboard" element={<Dashboard />} />
        <Route path="/client/layoult" element={<Layoult>{<></>}</Layoult>} />
        <Route path="/admin" element={<Admin></Admin>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
