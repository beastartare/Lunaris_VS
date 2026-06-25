import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";

const rotaPadrao: Record<number, string> = {
  0: "/client/dashboard",
  1: "/pesquisador/dashboard",
  2: "/pesquisador/dashboard",
  3: "/admin",
};

type Status =
  | "loading"
  | "authorized"
  | "unauthorized"
  | "unauthenticated";

interface ProtectedRouteProps {
  tiposPermitidos: number[];
  children: React.ReactNode;
}

export default function ProtectedRoute({
  tiposPermitidos,
  children,
}: ProtectedRouteProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [tipoUsuario, setTipoUsuario] = useState<number | null>(null);

  useEffect(() => {
    const verificar = async () => {
      try {
        // Banco apagado -> libera acesso
        const databaseMissing =
          sessionStorage.getItem("database_missing");

        if (databaseMissing === "true") {
          setStatus("authorized");
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setStatus("unauthenticated");
          return;
        }

        const { data: usuario, error: usuarioError } = await supabase
          .from("usuario")
          .select("tipo_acesso_usuario")
          .eq("id", user.id)
          .single();

        if (usuarioError || !usuario) {
          setStatus("unauthenticated");
          return;
        }

        const tipo = usuario.tipo_acesso_usuario;

        setTipoUsuario(tipo);

        if (tiposPermitidos.includes(tipo)) {
          setStatus("authorized");
        } else {
          setStatus("unauthorized");
        }
      } catch (err) {
        console.error(err);
        setStatus("unauthenticated");
      }
    };

    verificar();
  }, [tiposPermitidos]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2a102f] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
          <p className="text-gray-400">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  if (status === "unauthorized" && tipoUsuario !== null) {
    const destino = rotaPadrao[tipoUsuario] ?? "/";
    return <Navigate to={destino} replace />;
  }

  return <>{children}</>;
}