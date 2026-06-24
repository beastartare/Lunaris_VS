import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./lib/components/login";
import Register from "./lib/components/register";
import Dashboard from "./lib/components/client/dashboard";
import CorposCelestes from "./lib/components/client/corpos-celestes";
import MaterialEstudos from "./lib/components/client/material_estudos";
import Missoes from "./lib/components/client/mision";
import Favoritos from "./lib/components/client/favoritos";
import Observacoes from "./lib/components/client/observacoes";
import Layoult from "./lib/components/client/layoult";
import Admin from "./lib/components/admin/home";
import Pesquisador from "./lib/components/pesquisador/layoult";
import Cadastro from "./lib/components/pesquisador/cadastro";
import MinhaBiblioteca from "./lib/components/pesquisador/minha-biblioteca";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/client/dashboard"
          element={
            <Layoult>
              <Dashboard />
            </Layoult>
          }
        />
        <Route
          path="/client/observacoes"
          element={
            <Layoult>
              <Observacoes />
            </Layoult>
          }
        />
        <Route
          path="/client/corpos-celestes"
          element={
            <Layoult>
              <CorposCelestes />
            </Layoult>
          }
        />
        <Route
          path="/client/material-estudos"
          element={
            <Layoult>
              <MaterialEstudos />
            </Layoult>
          }
        />
        <Route
          path="/client/missoes"
          element={
            <Layoult>
              <Missoes />
            </Layoult>
          }
        />
        <Route
          path="/client/favoritos"
          element={
            <Layoult>
              <Favoritos />
            </Layoult>
          }
        />
        <Route
          path="/pesquisador/dashboard"
          element={
            <Pesquisador>
              <Dashboard />
            </Pesquisador>
          }
        />
        <Route
          path="/pesquisador/cadastro"
          element={
            <Pesquisador>
              <Cadastro />
            </Pesquisador>
          }
        />
        <Route
          path="/pesquisador/minha-biblioteca"
          element={
            <Pesquisador>
              <MinhaBiblioteca />
            </Pesquisador>
          }
        />
        <Route path="/client/layoult" element={<Layoult>{<></>}</Layoult>} />
        <Route path="/admin" element={<Admin></Admin>}></Route>
        <Route
          path="/pesquisador/layoult"
          element={<Pesquisador>{<></>}</Pesquisador>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
