import { supabase } from "../lib/supabase"

export async function criarBanco() {
  return await supabase.rpc(
    "criar_banco"
  );
}

export async function apagarBanco() {
  return await supabase.rpc(
    "apagar_banco"
  );
}

export async function popularBanco() {
  return await supabase.rpc(
    "popular_banco"
  );
}

export async function existeBanco() {
  return await supabase.rpc(
    "banco_esta_vazio"
  );
}