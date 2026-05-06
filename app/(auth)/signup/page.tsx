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
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      // Faz sign out para evitar que o usuário fique logado antes de confirmar o email
      await supabase.auth.signOut();
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: 'var(--pine-teal)', color: 'var(--dust-grey)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--pine-teal)' }}>
            Criar sua conta
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Comece a organizar suas coleções hoje mesmo.
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          {error && (
            <div
              className="text-sm p-3 rounded-lg animate-fade-in-scale"
              style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#b91c1c', border: '1px solid rgba(220, 38, 38, 0.2)' }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="text-sm p-3 rounded-lg animate-fade-in-scale"
              style={{ backgroundColor: 'rgba(88, 129, 87, 0.15)', color: 'var(--fern)', border: '1px solid rgba(88, 129, 87, 0.3)' }}
            >
              ✓ Conta criada! Verifique seu e-mail para confirmar.
            </div>
          )}

          <div className="animate-slide-up stagger-1">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--hunter-green)' }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
              style={{
                border: '1.5px solid var(--border)',
                backgroundColor: '#fff',
                color: 'var(--pine-teal)',
              }}
              placeholder="seu@email.com"
              onFocus={(e) => { e.target.style.borderColor = 'var(--fern)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,129,87,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div className="animate-slide-up stagger-2">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--hunter-green)' }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
              style={{
                border: '1.5px solid var(--border)',
                backgroundColor: '#fff',
                color: 'var(--pine-teal)',
              }}
              placeholder="••••••••"
              onFocus={(e) => { e.target.style.borderColor = 'var(--fern)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,129,87,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold text-sm tracking-wide shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up stagger-3"
            style={{
              backgroundColor: 'var(--pine-teal)',
              color: 'var(--dust-grey)',
            }}
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm animate-slide-up stagger-4" style={{ color: 'var(--text-muted)' }}>
          Já tem uma conta?{" "}
          <Link href="/login" className="font-semibold transition-colors duration-200 hover:underline underline-offset-2"
            style={{ color: 'var(--pine-teal)' }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}