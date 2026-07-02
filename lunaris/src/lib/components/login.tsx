import {
  Mail,
  Lock,
  EyeOff,
  UserPlus,
  Telescope,
  Orbit,
  BarChart3,
  Eye,
} from "lucide-react";

import fundo from "../../assets/fundo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkAndCreateUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        checkAndCreateUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAndCreateUser = async (user: any) => {
    // Evita loop se for o administrador dono logando sem banco inicializado
    if (sessionStorage.getItem("database_missing") === "true") return;

    const { data: usuarios, error: usuariosError } = await supabase
      .from("usuario")
      .select("idusuario")
      .limit(1);

    if (usuariosError || !usuarios || usuarios.length === 0) {
      await supabase.auth.signOut();
      alert("O sistema não foi inicializado. Apenas o administrador pode acessar via e-mail pela primeira vez.");
      return;
    }

    const { data: profile } = await supabase
      .from("usuario")
      .select("*")
      .eq("email", user.email)
      .single();

    if (!profile) {
      const { error: insertError } = await supabase.from("usuario").insert([
        {
          id: user.id,
          nome: user.user_metadata?.full_name || user.email.split("@")[0],
          email: user.email,
          username: user.email.split("@")[0],
          tipo_acesso_usuario: 0,
        },
      ]);

      if (insertError) {
        console.error("Erro ao criar usuário via Google:", insertError);
        alert("Erro ao sincronizar sua conta Google.");
        await supabase.auth.signOut();
        return;
      }
      navigate("/client/dashboard");
      return;
    }

    if (profile.tipo_acesso_usuario === 3) {
      navigate("/admin");
    } else if (profile.tipo_acesso_usuario === 0) {
      navigate("/client/dashboard");
    } else {
      navigate("/pesquisador/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      alert("Erro ao iniciar login com Google: " + error.message);
    }
  };

  async function HandleLogin(e) {
  e.preventDefault();

  const { data: usuarios, error: usuariosError } = await supabase
    .from("usuario")
    .select("idusuario")
    .limit(1);

  if (
    usuariosError ||
    !usuarios ||
    usuarios.length === 0
  ) {
    sessionStorage.setItem(
      "database_missing",
      "true"
    );
    const EMAIL_DONO = "lunaris@email.com";
    const SENHA_DONO = "admin123"

    if (email === EMAIL_DONO && password == SENHA_DONO) {
      navigate("/admin");
      return;
    }

    await supabase.auth.signOut();

    alert(
      "O sistema não foi inicializado. Apenas o administrador proprietário pode acessar."
    );

    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  const userEmail = data.user.email;

  // Fluxo normal
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
      navigate("/client/dashboard");
      return;
    }

    navigate("/pesquisador/dashboard");
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
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Sua senha"
                    className="w-full bg-transparent outline-none text-pink-50 placeholder:text-pink-100/40"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    className="text-pink-200/60 hover:text-pink-200 transition"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
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

              {/* Login Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 text-pink-100 py-4 hover:bg-white/10 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Entrar com Google
              </button>

              {/* Create Account */}
              <button
                onClick={() => navigate("/register")}
                type="button"
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-pink-300/20 bg-white/5 text-pink-100 py-4 hover:bg-white/10 transition mt-2"
              >
                <UserPlus size={20} />
                Criar conta com E-mail
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