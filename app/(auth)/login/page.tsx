"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
    } else {
      // Deu certo! Manda o usuário para a página inicial
      router.push("/home");
      router.refresh();
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Entrar no Sletter
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Bem-vindo de volta! Sentimos sua falta.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-700">Senha</label>
              <a href="#" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
                Esqueceu a senha? (Dev)
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 py-3 font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Rodapé da página */}
        <p className="text-center text-sm text-zinc-600">
          Ainda não tem uma conta?{" "}
          <Link href="/signup" className="font-semibold text-zinc-900 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}