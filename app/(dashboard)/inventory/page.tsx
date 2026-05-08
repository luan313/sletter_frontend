"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";
import GlobalSearch from "@/components/GlobalSearch";
import LibraryItemCard from "@/components/LibraryItemCard";

interface CatalogMediaItem {
  id: number;
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  media_type: "movie" | "tv";
  watched: boolean;
}

interface CatalogGameItem {
  id: number;
  rawg_id: number;
  title: string;
  background_image?: string | null;
  status: "unplayed" | "playing" | "completed";
}

interface FullCatalogResponse {
  movies: CatalogMediaItem[];
  series: CatalogMediaItem[];
  games: CatalogGameItem[];
}

export default function InventoryPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<CatalogMediaItem[]>([]);
  const [series, setSeries] = useState<CatalogMediaItem[]>([]);
  const [games, setGames] = useState<CatalogGameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<FullCatalogResponse>("/catalog/all");
      setMovies(data.movies ?? []);
      setSeries(data.series ?? []);
      setGames(data.games ?? []);
    } catch (err: any) {
      setError(err.message || "Nao foi possivel carregar seu inventario.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const totalItems = movies.length + series.length + games.length;

  const getMediaStatusLabel = (watched: boolean) => (watched ? "Assistido" : "Nao assistido");

  const getGameStatusLabel = (status: CatalogGameItem["status"]) => {
    if (status === "playing") return "Jogando";
    if (status === "completed") return "Finalizado";
    return "Nao jogado";
  };

  const statusBadgeStyle = {
    backgroundColor: "rgba(52,78,65,0.82)",
    color: "var(--dust-grey)",
    border: "1px solid rgba(163,177,138,0.55)",
  };

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: "var(--bg-primary)" }}>
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 shadow-lg"
        style={{ backgroundColor: "var(--pine-teal)", borderBottom: "1px solid rgba(163,177,138,0.2)" }}
      >
        <Link href="/home" className="flex items-center gap-3 group">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: "var(--dry-sage)", color: "var(--pine-teal)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: "var(--dust-grey)" }}>
            Sletter
          </span>
        </Link>
        
        <GlobalSearch searchTypes={["media", "games"]} />

        <div className="flex items-center gap-4">
          <Link href="/discover" className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
            Descobrir
          </Link>
          <Link href="/home" className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
            Inicio
          </Link>
        </div>
      </nav>

      <div className="px-6 py-8 md:px-12 lg:px-20">
        <header className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: "var(--pine-teal)" }}>
            Inventario
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Todas as suas obras separadas por jogos, filmes e series.
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--hunter-green)" }}>
            {totalItems} itens no inventario
          </div>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--dry-sage)", borderTopColor: "var(--pine-teal)" }} />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>
              {error}
            </p>
            <button onClick={fetchCatalog} className="text-sm font-semibold underline cursor-pointer" style={{ color: "var(--fern)" }}>
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && totalItems === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--pine-teal)" }}>
              Seu inventario esta vazio
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Use a tela de discover para adicionar filmes, series e jogos.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: "var(--fern)", color: "var(--dust-grey)" }}
            >
              Adicionar obra
            </Link>
          </div>
        )}

        {!loading && !error && totalItems > 0 && (
          <div className="space-y-12">
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-2xl font-bold" style={{ color: "var(--hunter-green)" }}>
                  Filmes
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--hunter-green)" }}>
                  {movies.length}
                </span>
              </div>
              {movies.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Nenhum filme adicionado ainda.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((item, i) => (
                    <LibraryItemCard
                      key={`movie-${item.id}`}
                      apiId={item.tmdb_id}
                      type="movie"
                      title={item.title}
                      image={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null}
                      status={item.watched}
                      onRefresh={fetchCatalog}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="animate-slide-up" style={{ animationDelay: "0.08s" }}>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-2xl font-bold" style={{ color: "var(--hunter-green)" }}>
                  Series
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--hunter-green)" }}>
                  {series.length}
                </span>
              </div>
              {series.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Nenhuma serie adicionada ainda.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {series.map((item, i) => (
                    <LibraryItemCard
                      key={`series-${item.id}`}
                      apiId={item.tmdb_id}
                      type="tv"
                      title={item.title}
                      image={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null}
                      status={item.watched}
                      onRefresh={fetchCatalog}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="animate-slide-up" style={{ animationDelay: "0.12s" }}>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-2xl font-bold" style={{ color: "var(--hunter-green)" }}>
                  Jogos
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--hunter-green)" }}>
                  {games.length}
                </span>
              </div>
              {games.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Nenhum jogo adicionado ainda.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {games.map((item, i) => (
                    <LibraryItemCard
                      key={`game-${item.id}`}
                      apiId={item.rawg_id}
                      type="game"
                      title={item.title}
                      image={item.background_image || null}
                      status={item.status}
                      onRefresh={fetchCatalog}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
