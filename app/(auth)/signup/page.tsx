"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Criar sua conta</h1>
          <p className="mt-2 text-sm text-zinc-600">Comece a organizar suas coleções hoje mesmo.</p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded">
              Conta criada! Verifique seu e-mail para confirmar.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 py-3 font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}