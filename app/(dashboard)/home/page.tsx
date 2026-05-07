"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { apiFetch } from "@/utils/api";

interface PreviewItem {
  id?: number;
  tmdb_id?: number;
  rawg_id?: number;
  title?: string;
  name?: string;
  poster_path?: string;
  background_image?: string;
  media_type?: string;
  watched?: boolean;
  status?: "unplayed" | "playing" | "completed";
}

interface Collection {
  id: string;
  name: string;
  created_at: string;
  preview_items: PreviewItem[];
}

interface CollectionDetailResponse {
  items: {
    movies: Array<{ watched?: boolean }>;
    series: Array<{ watched?: boolean }>;
    games: Array<{ status?: "unplayed" | "playing" | "completed" }>;
  };
}

export default function HomePage() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [collectionProgress, setCollectionProgress] = useState<Record<string, number>>({});
  const [collectionTotalItems, setCollectionTotalItems] = useState<Record<string, number>>({});
  const [activeCollectionMenuId, setActiveCollectionMenuId] = useState<string | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<{ collections: Collection[] }>("/collections/");
      const fetchedCollections = data.collections || [];
      setCollections(fetchedCollections);

      const progressAndTotalEntries = await Promise.all(
        fetchedCollections.map(async (collection) => {
          const details = await apiFetch<CollectionDetailResponse>(`/collections/${collection.id}`);
          const movies = details.items?.movies ?? [];
          const series = details.items?.series ?? [];
          const games = details.items?.games ?? [];

          const total = movies.length + series.length + games.length;
          if (total === 0) return [collection.id, { progress: 0, total: 0 }] as const;

          const completedMedia = [...movies, ...series].filter((item) => Boolean(item.watched)).length;
          const completedGames = games.filter((game) => game.status === "completed").length;
          const percentage = Math.round(((completedMedia + completedGames) / total) * 100);

          return [collection.id, { progress: percentage, total }] as const;
        })
      );

      const progressMap: Record<string, number> = {};
      const totalMap: Record<string, number> = {};
      progressAndTotalEntries.forEach(([collectionId, values]) => {
        progressMap[collectionId] = values.progress;
        totalMap[collectionId] = values.total;
      });
      setCollectionProgress(progressMap);
      setCollectionTotalItems(totalMap);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      const clickInsideMenu = (event.target as HTMLElement | null)?.closest?.("[data-collection-menu-root]");
      if (!clickInsideMenu) {
        setActiveCollectionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await apiFetch("/collections/create", {
        method: "POST",
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });
      setNewCollectionName("");
      setShowCreateModal(false);
      fetchCollections();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const getItemTitle = (item: PreviewItem) => item.title || item.name || "Sem título";
  const getItemImage = (item: PreviewItem) => {
    if (item.poster_path) return `https://image.tmdb.org/t/p/w300${item.poster_path}`;
    if (item.background_image) return item.background_image;
    return null;
  };
  const getStatusLabel = (item: PreviewItem) => {
    if (item.media_type === "movie" || item.media_type === "tv") {
      return item.watched ? "Assistido" : "Nao assistido";
    }

    if (item.status === "completed") return "Finalizado";
    if (item.status === "playing") return "Jogando";
    return "Nao jogado";
  };

  const handleItemClick = (item: PreviewItem) => {
    if (item.media_type === "movie" && item.tmdb_id) {
      router.push(`/movie/${item.tmdb_id}`);
    } else if (item.media_type === "tv" && item.tmdb_id) {
      router.push(`/tv/${item.tmdb_id}`);
    } else if (item.rawg_id) {
      router.push(`/game/${item.rawg_id}`);
    }
  };

  return (
    <main className="min-h-screen w-full transition-all duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 shadow-lg"
        style={{ backgroundColor: 'var(--pine-teal)', borderBottom: '1px solid rgba(163,177,138,0.2)' }}>
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: 'var(--dry-sage)', color: 'var(--pine-teal)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--dust-grey)' }}>Sletter</span>
        </Link>

        <div className="flex-1 max-w-md mx-8 hidden sm:block">
          <input type="search" placeholder="Pesquisar coleções ou itens..."
            className="w-full rounded-xl px-5 py-2.5 text-sm transition-all duration-300 focus:outline-none focus:ring-2"
            style={{ backgroundColor: 'rgba(218,215,205,0.12)', border: '1px solid rgba(163,177,138,0.3)', color: 'var(--dust-grey)' }}
            onFocus={(e) => { e.target.style.backgroundColor = 'rgba(218,215,205,0.2)'; e.target.style.borderColor = 'var(--dry-sage)'; }}
            onBlur={(e) => { e.target.style.backgroundColor = 'rgba(218,215,205,0.12)'; e.target.style.borderColor = 'rgba(163,177,138,0.3)'; }}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'var(--dry-sage)', color: 'var(--pine-teal)', border: profileOpen ? '2px solid var(--dust-grey)' : '2px solid transparent' }}>
              PF
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-52 rounded-xl shadow-2xl overflow-hidden animate-fade-in-scale"
                style={{ backgroundColor: 'var(--pine-teal)', border: '1px solid rgba(163,177,138,0.3)' }}>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm opacity-50 cursor-default" style={{ color: 'var(--dust-grey)' }} disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Perfil
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm opacity-50 cursor-default" style={{ color: 'var(--dust-grey)' }} disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Configurações
                  </button>
                  <div className="my-1" style={{ borderTop: '1px solid rgba(163,177,138,0.2)' }} />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-all duration-200"
                    style={{ color: '#f87171' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <div className="px-6 py-8 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--pine-teal)' }}>Início</h1>
            <p className="mt-2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Suas coleções pessoais.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/inventory"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--hunter-green)', color: 'var(--dust-grey)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
              Inventário
            </Link>
            <Link href="/collections"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--dry-sage)', color: 'var(--pine-teal)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Ver coleções
            </Link>
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'var(--pine-teal)', color: 'var(--dust-grey)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nova coleção
            </button>
            <Link href="/discover"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--fern)', color: 'var(--dust-grey)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Adicionar obra
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: 'var(--dry-sage)', borderTopColor: 'var(--pine-teal)' }} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-sm mb-4" style={{ color: '#b91c1c' }}>{error}</p>
            <button onClick={fetchCollections} className="text-sm font-semibold underline cursor-pointer" style={{ color: 'var(--fern)' }}>Tentar novamente</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && collections.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: 'rgba(163,177,138,0.25)', color: 'var(--fern)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--pine-teal)' }}>Nenhuma coleção ainda</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Crie sua primeira coleção e comece a organizar seus filmes, séries e jogos.</p>
            <button onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{ backgroundColor: 'var(--pine-teal)', color: 'var(--dust-grey)' }}>
              Criar primeira coleção
            </button>
          </div>
        )}

        {/* Collections */}
        {!loading && !error && collections.length > 0 && (
          <div className="space-y-12">
            {collections.slice(0, 5).map((col, idx) => (
              <section key={col.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--hunter-green)' }}>{col.name}</h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: 'var(--hunter-green)', backgroundColor: 'rgba(163,177,138,0.35)', border: '1px solid rgba(163,177,138,0.5)' }}>
                      {col.preview_items.length} itens
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(collectionTotalItems[col.id] ?? 0) > 0 && (
                      <div className="relative" data-collection-menu-root>
                        <button
                          type="button"
                          onClick={() => setActiveCollectionMenuId((prev) => (prev === col.id ? null : col.id))}
                          className="h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
                          style={{ backgroundColor: "rgba(88,129,87,0.12)", color: "var(--hunter-green)" }}
                          aria-label={`Ações da coleção ${col.name}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="1.8" />
                            <circle cx="12" cy="12" r="1.8" />
                            <circle cx="12" cy="19" r="1.8" />
                          </svg>
                        </button>
                        {activeCollectionMenuId === col.id && (
                          <div
                            className="absolute right-0 mt-2 min-w-[210px] rounded-xl shadow-lg py-1 z-30"
                            style={{ backgroundColor: "#fff", border: "1px solid rgba(163,177,138,0.4)" }}
                          >
                            <Link href={`/collections/${col.id}/add`} className="block px-4 py-2 text-sm font-medium hover:bg-black/5" style={{ color: "var(--pine-teal)" }}>
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
                    )}
                    <Link href={`/collections/${col.id}`} className="text-sm font-semibold transition-colors duration-300 hover:underline underline-offset-4" style={{ color: 'var(--fern)' }}>
                      Ver coleção
                    </Link>
                  </div>
                </div>

                {(collectionTotalItems[col.id] ?? 0) === 0 ? (
                  <p className="mb-5 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    A coleção está vazia.
                  </p>
                ) : (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Concluido</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--hunter-green)' }}>
                        {collectionProgress[col.id] ?? 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(163,177,138,0.35)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${collectionProgress[col.id] ?? 0}%`,
                          background: 'linear-gradient(90deg, var(--fern), var(--hunter-green))',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {col.preview_items.slice(0, 5).map((item, i) => {
                    const img = getItemImage(item);
                    return (
                      <div key={`${col.id}-${item.id || i}`}
                        onClick={() => handleItemClick(item)}
                        className="aspect-[2/3] w-full rounded-2xl shadow-md cursor-pointer group overflow-hidden relative transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-scale"
                        style={{ backgroundColor: 'var(--hunter-green)', animationDelay: `${0.1 + i * 0.07}s` }}>
                        {img && <img src={img} alt={getItemTitle(item)} className="absolute inset-0 w-full h-full object-cover" />}
                        <div className="absolute top-2 right-2 z-20 text-[10px] px-2 py-1 rounded-full font-semibold"
                          style={{ backgroundColor: 'rgba(52,78,65,0.82)', color: 'var(--dust-grey)', border: '1px solid rgba(163,177,138,0.55)' }}>
                          {getStatusLabel(item)}
                        </div>
                        <div className="absolute inset-0 opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                          style={{ background: 'linear-gradient(to top, rgba(52,78,65,0.95), rgba(52,78,65,0.2), transparent)' }} />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="relative z-10 font-bold text-sm tracking-wide drop-shadow-lg leading-snug" style={{ color: 'var(--dust-grey)' }}>
                            {getItemTitle(item)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {(collectionTotalItems[col.id] ?? 0) === 0 && (
                    <div className="relative" data-collection-menu-root>
                      <button
                        type="button"
                        onClick={() => setActiveCollectionMenuId((prev) => (prev === col.id ? null : col.id))}
                        className="aspect-[2/3] w-full rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                        style={{ backgroundColor: "rgba(88,129,87,0.08)", color: "var(--fern)" }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                        <span className="text-sm font-semibold mt-2">Ações</span>
                      </button>
                      {activeCollectionMenuId === col.id && (
                        <div
                          className="absolute right-0 -top-2 min-w-[210px] rounded-xl shadow-lg py-1 z-30"
                          style={{ backgroundColor: "#fff", border: "1px solid rgba(163,177,138,0.4)" }}
                        >
                          <Link href={`/collections/${col.id}/add`} className="block px-4 py-2 text-sm font-medium hover:bg-black/5" style={{ color: "var(--pine-teal)" }}>
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
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar Coleção */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(52,78,65,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-scale" style={{ backgroundColor: '#fff' }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--pine-teal)' }}>Nova coleção</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Dê um nome para sua nova coleção.</p>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              {createError && (
                <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#b91c1c', border: '1px solid rgba(220,38,38,0.2)' }}>
                  {createError}
                </div>
              )}
              <input type="text" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} maxLength={50}
                placeholder="Ex: Filmes Favoritos" autoFocus required
                className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
                style={{ border: '1.5px solid var(--border)', color: 'var(--pine-teal)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--fern)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,129,87,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={creating}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: 'var(--pine-teal)', color: 'var(--dust-grey)' }}>
                  {creating ? "Criando..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
