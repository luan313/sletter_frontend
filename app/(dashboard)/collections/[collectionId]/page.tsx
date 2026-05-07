"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/utils/api";

interface CollectionDetails {
  id: string;
  name: string;
  created_at: string;
}

interface MediaItem {
  id: number;
  tmdb_id: number;
  title?: string;
  poster_path?: string | null;
  media_type: "movie" | "tv";
  watched?: boolean | "watched" | "not_watched" | "in_progress";
}

interface GameItem {
  id: number;
  rawg_id: number;
  title?: string;
  background_image?: string | null;
  status?: "unplayed" | "playing" | "completed";
}

interface CollectionResponse {
  collection_details: CollectionDetails;
  items: {
    movies: MediaItem[];
    series: MediaItem[];
    games: GameItem[];
  };
}

type RenderItem = {
  key: string;
  title: string;
  image: string | null;
  statusLabel: string;
  route: string;
};

export default function CollectionDetailsPage() {
  const params = useParams<{ collectionId: string }>();
  const router = useRouter();
  const collectionId = params.collectionId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<CollectionDetails | null>(null);
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [series, setSeries] = useState<MediaItem[]>([]);
  const [games, setGames] = useState<GameItem[]>([]);
  const [showActions, setShowActions] = useState(false);

  const isWatched = (value: MediaItem["watched"]) => value === true || value === "watched";

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<CollectionResponse>(`/collections/${collectionId}`);
      setCollection(data.collection_details);
      setMovies(data.items?.movies ?? []);
      setSeries(data.items?.series ?? []);
      setGames(data.items?.games ?? []);
    } catch (err: any) {
      setError(err.message || "Nao foi possivel carregar esta colecao.");
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      const clickInsideMenu = (event.target as HTMLElement | null)?.closest?.("[data-collection-actions]");
      if (!clickInsideMenu) setShowActions(false);
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const totalItems = movies.length + series.length + games.length;
  const completedMedia = [...movies, ...series].filter((item) => isWatched(item.watched)).length;
  const completedGames = games.filter((item) => item.status === "completed").length;
  const progress = totalItems > 0 ? Math.round(((completedMedia + completedGames) / totalItems) * 100) : 0;

  const renderedItems = useMemo<RenderItem[]>(() => {
    const mediaEntries = [...movies, ...series].map((item) => ({
      key: `media-${item.media_type}-${item.id}`,
      title: item.title || "Sem titulo",
      image: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
      statusLabel: isWatched(item.watched) ? "Assistido" : "Nao assistido",
      route: `/${item.media_type}/${item.tmdb_id}`
    }));

    const gameEntries = games.map((item) => ({
      key: `game-${item.id}`,
      title: item.title || "Sem titulo",
      image: item.background_image || null,
      statusLabel: item.status === "completed" ? "Finalizado" : item.status === "playing" ? "Jogando" : "Nao jogado",
      route: `/game/${item.rawg_id}`
    }));

    return [...mediaEntries, ...gameEntries];
  }, [movies, series, games]);

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: "var(--bg-primary)" }}>
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 shadow-lg"
        style={{ backgroundColor: "var(--pine-teal)", borderBottom: "1px solid rgba(163,177,138,0.2)" }}
      >
        <Link href="/home" className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
          ← Voltar ao início
        </Link>
        <Link href="/collections" className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
          Todas as coleções
        </Link>
      </nav>

      <div className="px-6 py-8 md:px-12 lg:px-20">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--dry-sage)", borderTopColor: "var(--pine-teal)" }} />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>{error}</p>
            <button onClick={fetchCollection} className="text-sm font-semibold underline cursor-pointer" style={{ color: "var(--fern)" }}>
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && collection && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--pine-teal)" }}>
                  {collection.name}
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: "var(--hunter-green)", backgroundColor: "rgba(163,177,138,0.35)", border: "1px solid rgba(163,177,138,0.5)" }}>
                  {totalItems} itens
                </span>
              </div>

              <div className="relative" data-collection-actions>
                <button
                  type="button"
                  onClick={() => setShowActions((prev) => !prev)}
                  className="h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: "rgba(88,129,87,0.12)", color: "var(--hunter-green)" }}
                  aria-label={`Ações da coleção ${collection.name}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                </button>
                {showActions && (
                  <div className="absolute right-0 mt-2 min-w-[210px] rounded-xl shadow-lg py-1 z-30" style={{ backgroundColor: "#fff", border: "1px solid rgba(163,177,138,0.4)" }}>
                    <Link href={`/collections/${collection.id}/add`} className="block px-4 py-2 text-sm font-medium hover:bg-black/5" style={{ color: "var(--pine-teal)" }}>
                      Adicionar obra
                    </Link>
                    <button type="button" className="w-full text-left px-4 py-2 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                      Editar coleção
                    </button>
                    <button type="button" className="w-full text-left px-4 py-2 text-sm font-medium" style={{ color: "#b91c1c" }}>
                      Excluir coleção
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Concluido</span>
                <span className="text-xs font-bold" style={{ color: "var(--hunter-green)" }}>
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(163,177,138,0.35)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--fern), var(--hunter-green))" }} />
              </div>
            </div>

            {renderedItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                  Esta coleção está vazia.
                </p>
                <Link href={`/collections/${collection.id}/add`} className="px-5 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--fern)", color: "var(--dust-grey)" }}>
                  Adicionar obra
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {renderedItems.map((item, index) => (
                  <article
                    key={item.key}
                    onClick={() => router.push(item.route)}
                    className="aspect-[2/3] w-full rounded-2xl shadow-md cursor-pointer group overflow-hidden relative transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-scale"
                    style={{ backgroundColor: "var(--hunter-green)", animationDelay: `${index * 0.03}s` }}
                  >
                    {item.image && <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute top-2 right-2 z-20 text-[10px] px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(52,78,65,0.82)", color: "var(--dust-grey)", border: "1px solid rgba(163,177,138,0.55)" }}>
                      {item.statusLabel}
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(52,78,65,0.95) 35%, rgba(52,78,65,0.35) 65%, transparent)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="font-bold text-xs leading-tight block" style={{ color: "var(--dust-grey)" }}>
                        {item.title}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
