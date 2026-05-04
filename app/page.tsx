import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-8">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
          Sletter
        </h1>
        <p className="text-lg text-zinc-600 mb-8 max-w-md">
          Organize seus filmes, séries e jogos em um só lugar. 
          Sua biblioteca pessoal, do seu jeito.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
          >
            Entrar
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-3 border border-zinc-300 text-zinc-900 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}