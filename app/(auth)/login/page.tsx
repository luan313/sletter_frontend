"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const verified = searchParams.get("verified") === "true";
  const verificationError = searchParams.get("error") === "verification_failed";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Mensagem específica para cada tipo de erro
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
      } else if (error.message.toLowerCase().includes("invalid login credentials")) {
        setError("E-mail ou senha incorretos.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      // Deu certo! Manda o usuário para a página inicial
      router.push("/home");
      router.refresh();
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Cabeçalho */}
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: 'var(--pine-teal)', color: 'var(--dust-grey)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--pine-teal)' }}>
            Entrar no Sletter
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Bem-vindo de volta! Sentimos sua falta.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          {verified && (
            <div
              className="text-sm p-3 rounded-lg animate-fade-in-scale"
              style={{ backgroundColor: 'rgba(88, 129, 87, 0.15)', color: 'var(--fern)', border: '1px solid rgba(88, 129, 87, 0.3)' }}
            >
              ✓ E-mail verificado com sucesso! Faça login para continuar.
            </div>
          )}
          {verificationError && (
            <div
              className="text-sm p-3 rounded-lg animate-fade-in-scale"
              style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#b91c1c', border: '1px solid rgba(220, 38, 38, 0.2)' }}
            >
              Falha na verificação do e-mail. Tente novamente.
            </div>
          )}
          {error && (
            <div
              className="text-sm p-3 rounded-lg animate-fade-in-scale"
              style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#b91c1c', border: '1px solid rgba(220, 38, 38, 0.2)' }}
            >
              {error}
            </div>
          )}

          <div className="animate-slide-up stagger-1">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--hunter-green)' }}>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                border: '1.5px solid var(--border)',
                backgroundColor: '#fff',
                color: 'var(--pine-teal)',
                focusRingColor: 'var(--fern)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--fern)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,129,87,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div className="animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium" style={{ color: 'var(--hunter-green)' }}>Senha</label>
              <a href="#" className="text-xs font-medium transition-colors duration-200" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--pine-teal)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
              >
                Esqueceu a senha?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                border: '1.5px solid var(--border)',
                backgroundColor: '#fff',
                color: 'var(--pine-teal)',
              }}
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
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Rodapé da página */}
        <p className="text-center text-sm animate-slide-up stagger-4" style={{ color: 'var(--text-muted)' }}>
          Ainda não tem uma conta?{" "}
          <Link href="/signup" className="font-semibold transition-colors duration-200 hover:underline underline-offset-2"
            style={{ color: 'var(--pine-teal)' }}
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}