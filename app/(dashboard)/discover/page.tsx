"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useRef, useCallback } from "react";
import { apiFetch } from "@/utils/api";

interface MediaResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  media_type?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

interface GameResult {
  id: number;
  name: string;
  slug: string;
  background_image?: string;
  released?: string;
  rating?: number;
  metacritic?: number;
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{ borderColor: "var(--dry-sage)", borderTopColor: "var(--pine-teal)" }} />
      </main>
    }>
      <DiscoverContent />
    </Suspense>
  );
}

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [mediaResults, setMediaResults] = useState<MediaResult[]>([]);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const collectionId = searchParams.get("collectionId") || "";

  const searchAll = useCallback(async (term: string) => {
    if (term.length < 2) {
      setMediaResults([]);
      setGameResults([]);
      setSearched(false);
      return;
    }

    setSearched(true);
    setError(null);

    // Buscar mídias (filmes/séries)
    setLoadingMedia(true);
    apiFetch<{ results: MediaResult[] }>(`/discover/new_movie?title=${encodeURIComponent(term)}`)
      .then((data) => {
        const filtered = (data.results || []).filter(
          (r) => r.media_type === "movie" || r.media_type === "tv"
        );
        setMediaResults(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingMedia(false));

    // Buscar jogos
    setLoadingGames(true);
    apiFetch<{ results: GameResult[] }>(`/discover/new_game?title=${encodeURIComponent(term)}`)
      .then((data) => setGameResults(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingGames(false));
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAll(value), 500);
  };

  const getMediaTitle = (item: MediaResult) => item.title || item.name || "Sem título";
  const getMediaYear = (item: MediaResult) => {
    const date = item.release_date || item.first_air_date;
    return date ? date.slice(0, 4) : "";
  };
  const getMediaType = (item: MediaResult) => (item.media_type === "movie" ? "Filme" : "Série");
  const getMediaImage = (item: MediaResult) => item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : "";

  const handleMediaCardClick = (item: MediaResult) => {
    const route = item.media_type === "tv" ? "tv" : "movie";
    router.push(`/${route}/${item.id}`);
  };

  const handleGameCardClick = (game: GameResult) => {
    router.push(`/game/${game.id}`);
  };

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 shadow-lg"
        style={{ backgroundColor: "var(--pine-teal)", borderBottom: "1px solid rgba(163,177,138,0.2)" }}>
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: "var(--dry-sage)", color: "var(--pine-teal)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: "var(--dust-grey)" }}>Sletter</span>
        </Link>
        <Link href="/home" className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
          ← Voltar ao início
        </Link>
      </nav>

      {/* Conteúdo */}
      <div className="px-6 py-8 md:px-12 lg:px-20">
        {/* Header + Search */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: "var(--pine-teal)" }}>Descobrir</h1>
          <p className="text-sm font-medium mb-6" style={{ color: "var(--text-muted)" }}>Pesquise filmes, séries e jogos para adicionar às suas coleções.</p>

          <div className="relative max-w-2xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <input
              type="text" value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Pesquisar filmes, séries ou jogos..."
              autoFocus
              className="w-full rounded-2xl pl-12 pr-5 py-4 text-base transition-all duration-300 focus:outline-none shadow-md"
              style={{ border: "2px solid var(--border)", backgroundColor: "#fff", color: "var(--pine-teal)" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--fern)"; e.target.style.boxShadow = "0 0 0 4px rgba(88,129,87,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"; }}
            />
            {(loadingMedia || loadingGames) && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--dry-sage)", borderTopColor: "var(--pine-teal)" }} />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm p-3 rounded-lg mb-6 max-w-2xl animate-fade-in" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {/* Prompt inicial */}
        {!searched && (
          <div className="text-center py-16 animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(163,177,138,0.25)", color: "var(--fern)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: "var(--pine-teal)" }}>Comece a pesquisar</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Digite o nome de um filme, série ou jogo acima.</p>
          </div>
        )}

        {/* Resultados de Mídia */}
        {searched && (
          <section className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--fern)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" /></svg>
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--hunter-green)" }}>Mídias encontradas</h2>
              {!loadingMedia && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--hunter-green)" }}>{mediaResults.length}</span>}
            </div>

            {loadingMedia ? (
              <div className="flex gap-4 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] w-44 flex-shrink-0 rounded-2xl animate-pulse" style={{ backgroundColor: "rgba(163,177,138,0.2)" }} />
                ))}
              </div>
            ) : mediaResults.length === 0 ? (
              <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>Nenhuma mídia encontrada para esta busca.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {mediaResults.slice(0, 12).map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMediaCardClick(item)}
                    className="aspect-[2/3] w-full rounded-2xl shadow-md cursor-pointer group overflow-hidden relative transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-scale"
                    style={{ backgroundColor: "var(--hunter-green)", animationDelay: `${i * 0.05}s` }}>
                    {item.poster_path && (
                      <img src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} alt={getMediaTitle(item)} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "linear-gradient(to top, rgba(52,78,65,0.95) 30%, rgba(52,78,65,0.4) 60%, transparent)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="font-bold text-xs leading-tight block mb-1" style={{ color: "var(--dust-grey)" }}>{getMediaTitle(item)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "var(--dry-sage)", color: "var(--pine-teal)" }}>{getMediaType(item)}</span>
                        {getMediaYear(item) && <span className="text-[10px] font-medium" style={{ color: "var(--dry-sage)" }}>{getMediaYear(item)}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Resultados de Jogos */}
        {searched && (
          <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--fern)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" /><line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></svg>
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--hunter-green)" }}>Jogos encontrados</h2>
              {!loadingGames && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--hunter-green)" }}>{gameResults.length}</span>}
            </div>

            {loadingGames ? (
              <div className="flex gap-4 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] w-44 flex-shrink-0 rounded-2xl animate-pulse" style={{ backgroundColor: "rgba(163,177,138,0.2)" }} />
                ))}
              </div>
            ) : gameResults.length === 0 ? (
              <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>Nenhum jogo encontrado para esta busca.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {gameResults.slice(0, 12).map((game, i) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleGameCardClick(game)}
                    className="aspect-[2/3] w-full rounded-2xl shadow-md cursor-pointer group overflow-hidden relative transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-scale"
                    style={{ backgroundColor: "var(--hunter-green)", animationDelay: `${i * 0.05}s` }}>
                    {game.background_image && (
                      <img src={game.background_image} alt={game.name} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "linear-gradient(to top, rgba(52,78,65,0.95) 30%, rgba(52,78,65,0.4) 60%, transparent)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="font-bold text-xs leading-tight block mb-1" style={{ color: "var(--dust-grey)" }}>{game.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "var(--dry-sage)", color: "var(--pine-teal)" }}>Jogo</span>
                        {game.released && <span className="text-[10px] font-medium" style={{ color: "var(--dry-sage)" }}>{game.released.slice(0, 4)}</span>}
                        {game.metacritic && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "rgba(88,129,87,0.4)", color: "var(--dust-grey)" }}>{game.metacritic}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
