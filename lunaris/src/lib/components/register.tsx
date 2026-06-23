import { useState } from "react";
import { Mail, Lock, User, UserPlus, EyeOff, ArrowLeft } from "lucide-react";
import fundo from "../../assets/fundo.png";
import { supabase } from "../supabase";

export default function Register() {
  const [form, setForm] = useState({
    nome: "",
    username: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.senha !== form.confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    console.log(form);

    // cadastrar usuário aqui
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
      });
      if (error) throw error;

      const user = data.user;

      if (!user) throw new Error("Usuário não encontrado após cadastro.");

      // Busca o maior id existente
      const { data: ultimoUsuario, error: ultimoErro } = await supabase
        .from("usuario")
        .select("idusuario")
        .order("idusuario", { ascending: false })
        .limit(1);

      if (ultimoErro) throw ultimoErro;

      // Define o próximo ID
      const novoId =
        ultimoUsuario && ultimoUsuario.length > 0
          ? ultimoUsuario[0].idusuario + 1
          : 1;

      // Insere o usuário
      const { error: profileError } = await supabase
        .from("usuario")
        .insert({
          idusuario: novoId,
          nome: form.nome,
          username: form.username,
          email: form.email,
          tipo_acesso_usuario: 0,
        });

      if (profileError) {
        console.error(profileError);
        throw profileError;
      }
      if (profileError) {
        console.error(profileError);
        throw profileError;
      }

      alert("Conta criada com sucesso");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-6 py-10"
      style={{
        backgroundImage: `url(${fundo})`,
      }}
    >
      <div className="absolute inset-0 bg-[#120616]/60 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-xl rounded-4xl border border-pink-200/15 bg-[#2a102f]/55 backdrop-blur-2xl p-10 shadow-2xl shadow-pink-900/20">
            <button className="flex items-center gap-2 text-pink-200/80 hover:text-pink-100 mb-8">
              <ArrowLeft size={18} />
              Voltar
            </button>

            <div className="text-center mb-10">
              <div className="text-pink-200 text-3xl mb-3">✦</div>

              <h2 className="text-4xl font-semibold text-pink-100 mb-3">
                Criar Conta
              </h2>

              <p className="text-pink-100/70">Junte-se ao universo Lunaris</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div>
                <label className="block text-sm tracking-widest text-pink-100/80 mb-2">
                  NOME
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 px-5 py-4">
                  <User size={20} className="text-pink-200/70" />

                  <input
                    type="text"
                    name="nome"
                    placeholder="Nome completo"
                    value={form.nome}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-pink-50 placeholder:text-pink-100/40"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm tracking-widest text-pink-100/80 mb-2">
                  USUÁRIO
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 px-5 py-4">
                  <UserPlus size={20} className="text-pink-200/70" />

                  <input
                    type="text"
                    name="username"
                    placeholder="Seu usuário"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-pink-50 placeholder:text-pink-100/40"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm tracking-widest text-pink-100/80 mb-2">
                  E-MAIL
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 px-5 py-4">
                  <Mail size={20} className="text-pink-200/70" />

                  <input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-pink-50 placeholder:text-pink-100/40"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm tracking-widest text-pink-100/80 mb-2">
                  SENHA
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 px-5 py-4">
                  <Lock size={20} className="text-pink-200/70" />

                  <input
                    type="password"
                    name="senha"
                    placeholder="Digite sua senha"
                    value={form.senha}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-pink-50 placeholder:text-pink-100/40"
                  />

                  <EyeOff size={18} className="text-pink-200/50" />
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm tracking-widest text-pink-100/80 mb-2">
                  CONFIRMAR SENHA
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 px-5 py-4">
                  <Lock size={20} className="text-pink-200/70" />

                  <input
                    type="password"
                    name="confirmarSenha"
                    placeholder="Repita sua senha"
                    value={form.confirmarSenha}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-pink-50 placeholder:text-pink-100/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 rounded-2xl bg-linear-to-r from-pink-300 to-pink-200 text-[#2d102e] font-bold text-lg py-4 hover:scale-[1.01] transition"
              >
                Criar Conta
              </button>

              <div className="text-center pt-4">
                <span className="text-pink-100/60">Já possui uma conta?</span>

                <button
                  type="button"
                  className="ml-2 text-pink-200 hover:text-pink-100 font-medium"
                >
                  Entrar
                </button>
              </div>
            </form>

            <div className="mt-10 text-center text-sm text-pink-100/45">
              © 2026 Lunaris. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
