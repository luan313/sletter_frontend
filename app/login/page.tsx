import Link from "next/link";

export default function LoginPage() {
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
        <form className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
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
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 py-3 font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            Entrar
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