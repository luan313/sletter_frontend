import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8"
      style={{ background: 'linear-gradient(145deg, var(--pine-teal) 0%, var(--hunter-green) 35%, var(--fern) 70%, var(--dry-sage) 100%)' }}
    >
      <div className="text-center animate-fade-in">
        {/* Logo / Ícone decorativo */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
          style={{ backgroundColor: 'var(--dry-sage)', color: 'var(--pine-teal)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight mb-4"
          style={{ color: 'var(--dust-grey)' }}
        >
          Sletter
        </h1>
        <p className="text-lg mb-10 max-w-md mx-auto leading-relaxed"
          style={{ color: 'var(--dry-sage)' }}
        >
          Organize seus filmes, séries e jogos em um só lugar.
          Sua biblioteca pessoal, do seu jeito.
        </p>

        <div className="flex gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            style={{
              backgroundColor: 'var(--dust-grey)',
              color: 'var(--pine-teal)',
            }}
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide border-2 transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              borderColor: 'var(--dry-sage)',
              color: 'var(--dust-grey)',
              backgroundColor: 'transparent',
            }}
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}