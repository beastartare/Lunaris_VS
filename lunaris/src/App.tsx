import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import Login from "./lib/components/login";
import Register from "./lib/components/register";
import ProtectedRoute from "./lib/components/ProtectedRoute";

// Client (visitante — tipo 0)
import Layoult from "./lib/components/client/layoult";
import Dashboard from "./lib/components/client/dashboard";
import CorposCelestes from "./lib/components/client/corpos-celestes";
import MaterialEstudos from "./lib/components/client/material_estudos";
import Missoes from "./lib/components/client/mision";
import Favoritos from "./lib/components/client/favoritos";
import Observacoes from "./lib/components/client/observacoes";
import PontoObservacao from "./lib/components/client/ponto-observacao";
import Constelacoes from "./lib/components/client/constelacao";
import MinhasBibliotecaCliente from "./lib/components/client/minha-biblioteca";

// Pesquisador (tipo 1 = astronômico, tipo 2 = meteorológico)
import Pesquisador from "./lib/components/pesquisador/layoult";
import Cadastro from "./lib/components/pesquisador/cadastro";
import MinhaBiblioteca from "./lib/components/pesquisador/minha-biblioteca";
import Statistics from "./lib/components/admin/statistics";

// Admin (tipo 3)
import Admin from "./lib/components/admin/home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Rotas do Visitante (tipo 0) ───────────────── */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute tiposPermitidos={[0]}>
              <Layoult><Dashboard /></Layoult>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/observacoes"
          element={
            <ProtectedRoute tiposPermitidos={[0]}>
              <Layoult><Observacoes /></Layoult>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/corpos-celestes"
          element={
            <ProtectedRoute tiposPermitidos={[0]}>
              <Layoult><CorposCelestes /></Layoult>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/material-estudos"
          element={
            <ProtectedRoute tiposPermitidos={[0]}>
              <Layoult><MaterialEstudos /></Layoult>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/missoes"
          element={
            <ProtectedRoute tiposPermitidos={[0]}>
              <Layoult><Missoes /></Layoult>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/favoritos"
          element={
            <ProtectedRoute tiposPermitidos={[0]}>
              <Layoult><Favoritos /></Layoult>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/constelacao"
          element={
            <ProtectedRoute tiposPermitidos={[0]}>
              <Layoult><Constelacoes /></Layoult>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/pontos-observacao"
          element={
            <ProtectedRoute tiposPermitidos={[0]}>
              <Layoult><PontoObservacao /></Layoult>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/minha-biblioteca"
          element={
            <ProtectedRoute tiposPermitidos={[0]}>
              <Layoult><MinhasBibliotecaCliente /></Layoult>
            </ProtectedRoute>
          }
        />

        {/* ── Rotas do Pesquisador (tipo 1 = astro, tipo 2 = meteo) ── */}
        <Route
          path="/pesquisador/dashboard"
          element={
            <ProtectedRoute tiposPermitidos={[1, 2]}>
              <Pesquisador><Dashboard /></Pesquisador>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pesquisador/cadastro"
          element={
            <ProtectedRoute tiposPermitidos={[1, 2]}>
              <Pesquisador><Cadastro /></Pesquisador>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pesquisador/minha-biblioteca"
          element={
            <ProtectedRoute tiposPermitidos={[1, 2]}>
              <Pesquisador><MinhaBiblioteca /></Pesquisador>
            </ProtectedRoute>
          }
        />

        {/* ── Rota do Admin (tipo 3) ─────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute tiposPermitidos={[3]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/statistics" element={<Statistics></Statistics>}>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
