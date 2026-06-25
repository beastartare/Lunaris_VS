import { supabase } from "../supabase";

/**
 * Retorna o idusuario da tabela `usuario` do usuário autenticado.
 * Lança erro se não estiver autenticado ou não encontrado.
 */
export async function getIdusuario(): Promise<number> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("Usuário não autenticado.");

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuario")
    .select("idusuario")
    .eq("id", user.id)
    .single();

  if (usuarioError || !usuario) throw new Error("Usuário não encontrado.");

  return usuario.idusuario;
}
