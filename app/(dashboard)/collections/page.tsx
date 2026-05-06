"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";

interface Item {
  id?: number;
  title?: string;
  name?: string;
  poster_path?: string;
  background_image?: string;
  media_type?: "movie" | "tv";
  watched?: boolean;
  status?: "unplayed" | "playing" | "completed";
}

interface Collection {
  id: string;
  name: string;
  created_at: string;
  preview_items?: Item[];
}

export default function CollectionsOverviewPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollectionsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiFetch<{ collections: Collection[] }>("/collections/");
      const allCollections = data.collections ?? [];
      setCollections(allCollections);
    } catch (err: any) {
      setError(err.message || "Nao foi possivel carregar as colecoes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollectionsData();
  }, [fetchCollectionsData]);

  const getTitle = (item: Item) => item.title || item.name || "Sem titulo";
  const getImage = (item: Item) => {
    if (item.poster_path) return `https://image.tmdb.org/t/p/w300${item.poster_path}`;
    if (item.background_image) return item.background_image;
    return null;
  };

  const getStatusLabel = (item: Item) => {
    if (item.media_type === "movie" || item.media_type === "tv") {
      return item.watched ? "Assistido" : "Nao assistido";
    }
    if (item.status === "completed") return "Finalizado";
    if (item.status === "playing") return "Jogando";
    return "Nao jogado";
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
        <div className="flex items-center gap-4">
          <Link href="/inventory" className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
            Inventario
          </Link>
          <Link href="/home" className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
            Inicio
          </Link>
        </div>
      </nav>

      <div className="px-6 py-8 md:px-12 lg:px-20">
        <header className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: "var(--pine-teal)" }}>
            Todas as colecoes
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Visualize todos os itens organizados por colecao.
          </p>
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
            <button onClick={fetchCollectionsData} className="text-sm font-semibold underline cursor-pointer" style={{ color: "var(--fern)" }}>
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && collections.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--pine-teal)" }}>
              Nenhuma colecao encontrada
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Crie uma colecao e adicione obras para visualizar aqui.
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

        {!loading && !error && collections.length > 0 && (
          <div className="space-y-12">
            {collections.map((collection, collectionIndex) => {
              const items = collection.preview_items ?? [];
              return (
                <section key={collection.id} className="animate-slide-up" style={{ animationDelay: `${collectionIndex * 0.06}s` }}>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-2xl font-bold" style={{ color: "var(--hunter-green)" }}>
                      {collection.name}
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--hunter-green)" }}>
                      {items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      A coleção está vazia.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {items.map((item, index) => {
                        const image = getImage(item);
                        return (
                          <article
                            key={`${collection.id}-${item.id ?? index}`}
                            className="aspect-[2/3] w-full rounded-2xl shadow-md group overflow-hidden relative transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-scale"
                            style={{ backgroundColor: "var(--hunter-green)", animationDelay: `${index * 0.03}s` }}
                          >
                            {image && <img src={image} alt={getTitle(item)} className="absolute inset-0 w-full h-full object-cover" />}
                            <div className="absolute top-2 right-2 z-20 text-[10px] px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(52,78,65,0.82)", color: "var(--dust-grey)", border: "1px solid rgba(163,177,138,0.55)" }}>
                              {getStatusLabel(item)}
                            </div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(52,78,65,0.95) 35%, rgba(52,78,65,0.35) 65%, transparent)" }} />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <span className="font-bold text-xs leading-tight block" style={{ color: "var(--dust-grey)" }}>
                                {getTitle(item)}
                              </span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
