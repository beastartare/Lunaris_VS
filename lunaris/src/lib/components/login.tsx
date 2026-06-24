import {
  Mail,
  Lock,
  EyeOff,
  UserPlus,
  Telescope,
  Orbit,
  BarChart3,
} from "lucide-react";

import fundo from "../../assets/fundo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function HandleLogin(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const userEmail = data.user.email;

    const { data: profile, error: profileError } = await supabase
      .from("usuario")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (profileError) {
      alert(profileError.message);
      return;
    }

    if (profile.tipo_acesso_usuario === 3) {
      navigate("/admin");
      return;
    }
    if (profile.tipo_acesso_usuario === 0) {
      navigate("/client/layoult");
      return;
    }

    navigate("/pesquisador/layoult");
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-6 py-10"
      style={{
        backgroundImage: `url(${fundo})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#120616]/60 backdrop-blur-[1px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Side */}
        <div className="text-[#ffd3e8]">
          <div className="max-w-xl">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full border border-pink-300/40 flex items-center justify-center bg-pink-300/10 backdrop-blur-md">
                  <Orbit size={34} />
                </div>

                <h1 className="text-6xl font-light tracking-[0.4em]">
                  LUNARIS
                </h1>
              </div>

              <p className="tracking-[0.35em] text-sm text-pink-200/80 uppercase">
                Explorar. Entender. Inspirar.
              </p>
            </div>

            <p className="text-lg text-pink-100/80 leading-relaxed mb-14 max-w-lg">
              Um sistema completo para observação, análise e descoberta do
              universo.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-pink-300/10 rounded-2xl p-5 backdrop-blur-md">
                <Telescope className="mb-4 text-pink-200" size={28} />

                <h3 className="font-semibold tracking-wide mb-2">OBSERVE</h3>

                <p className="text-sm text-pink-100/70 leading-relaxed">
                  Corpos celestes em tempo real
                </p>
              </div>

              <div className="bg-white/5 border border-pink-300/10 rounded-2xl p-5 backdrop-blur-md">
                <BarChart3 className="mb-4 text-pink-200" size={28} />

                <h3 className="font-semibold tracking-wide mb-2">ANÁLISE</h3>

                <p className="text-sm text-pink-100/70 leading-relaxed">
                  Dados e imagens astronômicas
                </p>
              </div>

              <div className="bg-white/5 border border-pink-300/10 rounded-2xl p-5 backdrop-blur-md">
                <Orbit className="mb-4 text-pink-200" size={28} />

                <h3 className="font-semibold tracking-wide mb-2">DESCUBRA</h3>

                <p className="text-sm text-pink-100/70 leading-relaxed">
                  Explore o universo sem limites
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-xl rounded-4xl border border-pink-200/15 bg-[#2a102f]/55 backdrop-blur-2xl p-10 shadow-2xl shadow-pink-900/20">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="text-pink-200 text-3xl mb-3">✦</div>

              <h2 className="text-4xl font-semibold text-pink-100 mb-3">
                Bem-vindo(a) de volta!
              </h2>

              <p className="text-pink-100/70">
                Faça login para acessar o Lunaris
              </p>
            </div>

            {/* Form */}
            <form className="space-y-7" onSubmit={HandleLogin}>
              {/* Email */}
              <div>
                <label className="block text-sm tracking-widest text-pink-100/80 mb-3">
                  E-MAIL
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 px-5 py-4 focus-within:border-pink-300/50 transition">
                  <Mail className="text-pink-200/70" size={20} />

                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full bg-transparent outline-none text-pink-50 placeholder:text-pink-100/40"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm tracking-widest text-pink-100/80 mb-3">
                  SENHA
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 px-5 py-4 focus-within:border-pink-300/50 transition">
                  <Lock className="text-pink-200/70" size={20} />

                  <input
                    type="password"
                    placeholder="Sua senha"
                    className="w-full bg-transparent outline-none text-pink-50 placeholder:text-pink-100/40"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    className="text-pink-200/60 hover:text-pink-200 transition"
                  >
                    <EyeOff size={20} />
                  </button>
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    className="text-sm text-pink-200/70 hover:text-pink-100 transition"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full rounded-2xl bg-linear-to-r from-pink-300 to-pink-200 text-[#2d102e] font-bold text-lg py-4 hover:scale-[1.01] transition duration-300 shadow-lg shadow-pink-500/20"
              >
                Entrar
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-pink-200/15" />

                <span className="text-pink-100/50 text-sm">ou</span>

                <div className="flex-1 h-px bg-pink-200/15" />
              </div>

              {/* Create Account */}
              <button
                onClick={() => navigate("/register")}
                type="button"
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 text-pink-100 py-4 hover:bg-white/10 transition"
              >
                <UserPlus size={20} />
                Criar conta
              </button>
            </form>

            {/* Footer */}
            <div className="mt-10 text-center text-sm text-pink-100/45">
              © 2026 Lunaris. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
