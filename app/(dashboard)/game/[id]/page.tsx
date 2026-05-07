"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface RawgDetails {
  id: number;
  name: string;
  description_raw: string;
  background_image: string | null;
  background_image_additional: string | null;
  released: string;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  playtime: number;
  genres: { id: number; name: string }[];
  platforms: { platform: { id: number; name: string } }[];
  developers: { id: number; name: string }[];
  publishers: { id: number; name: string }[];
  esrb_rating: { id: number; name: string } | null;
  website: string;
}

interface RawgScreenshot {
  id: number;
  image: string;
  width: number;
  height: number;
}

interface RawgMovie {
  id: number;
  name: string;
  preview: string;
  data: { 480?: string; max?: string };
}

interface ApiResponse {
  details: RawgDetails;
  screenshots: RawgScreenshot[];
  movies: RawgMovie[];
}

interface Collection {
  id: string;
  name: string;
}

type GameStatus = "unplayed" | "playing" | "completed";

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inLibrary, setInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [gameStatus, setGameStatus] = useState<GameStatus>("unplayed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/rawg/${id}`);
      if (!res.ok) throw new Error("Não foi possível carregar os detalhes do jogo.");
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkLibrary = useCallback(async () => {
    try {
      setLibraryLoading(true);
      await apiFetch(`/game/${id}`);
      setInLibrary(true);
    } catch {
      setInLibrary(false);
    } finally {
      setLibraryLoading(false);
    }
  }, [id]);

  const fetchCollections = useCallback(async () => {
    try {
      const data = await apiFetch<{ collections: Collection[] }>("/collections/");
      setCollections(data.collections ?? []);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => {
    fetchDetails();
    checkLibrary();
  }, [fetchDetails, checkLibrary]);

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    fetchCollections();
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await apiFetch("/game/add_on_lib", {
        method: "POST",
        body: JSON.stringify({
          rawg_id: Number(id),
          status: gameStatus,
          collection_id: selectedCollectionId || null,
        }),
      });
      setSubmitSuccess("Jogo adicionado ao inventário!");
      setInLibrary(true);
      setTimeout(() => setShowAddModal(false), 1200);
    } catch (err: any) {
      setSubmitError(err.message || "Erro ao adicionar jogo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="flex items-center justify-center py-32 animate-fade-in">
          <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{ borderColor: "var(--dry-sage)", borderTopColor: "var(--pine-teal)" }} />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen w-full" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="text-center py-32 animate-fade-in">
          <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>{error || "Erro desconhecido."}</p>
          <button onClick={fetchDetails} className="text-sm font-semibold underline cursor-pointer" style={{ color: "var(--fern)" }}>Tentar novamente</button>
        </div>
      </main>
    );
  }

  const { details, screenshots, movies } = data;
  const bgUrl = details.background_image;
  const year = details.released ? details.released.slice(0, 4) : "";
  const metacritic = details.metacritic;

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
        <button onClick={() => router.back()} className="text-sm font-medium transition-colors duration-200 cursor-pointer" style={{ color: "var(--dry-sage)" }}>
          ← Voltar
        </button>
      </nav>

      {/* Hero */}
      <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
        {bgUrl ? (
          <img src={bgUrl} alt={details.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: "var(--hunter-green)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 35%, rgba(218,215,205,0.8) 55%, transparent 100%)" }} />
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 lg:px-20 -mt-48 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mb-12">
          {/* Image / Card */}
          <div className="animate-fade-in-scale">
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "3px solid rgba(218,215,205,0.3)" }}>
              {bgUrl ? (
                <img src={bgUrl} alt={details.name} className="w-full aspect-[4/3] object-cover" />
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: "var(--hunter-green)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--dust-grey)" }}>Sem imagem</span>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {!libraryLoading && (
                inLibrary ? (
                  <div className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "rgba(163,177,138,0.3)", color: "var(--hunter-green)", border: "1px solid rgba(163,177,138,0.5)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Na sua biblioteca
                  </div>
                ) : (
                  <button onClick={handleOpenAddModal}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: "var(--pine-teal)", color: "var(--dust-grey)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Adicionar ao inventário
                  </button>
                )
              )}

              {details.website && (
                <a href={details.website} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: "rgba(163,177,138,0.2)", color: "var(--hunter-green)", border: "1px solid rgba(163,177,138,0.4)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  Site oficial
                </a>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--dry-sage)", color: "var(--pine-teal)" }}>Jogo</span>
              {year && <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{year}</span>}
              {details.playtime > 0 && (
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{details.playtime}h de jogo</span>
              )}
              {details.rating > 0 && (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(88,129,87,0.2)", color: "var(--hunter-green)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  {details.rating.toFixed(1)}
                </span>
              )}
              {metacritic && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(88,129,87,0.35)", color: "var(--pine-teal)" }}>
                  Metacritic: {metacritic}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4" style={{ color: "var(--pine-teal)" }}>{details.name}</h1>

            {details.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {details.genres.map((g) => (
                  <span key={g.id} className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(163,177,138,0.25)", color: "var(--hunter-green)", border: "1px solid rgba(163,177,138,0.4)" }}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {details.description_raw && (
              <div className="mb-6">
                <h2 className="text-sm font-bold mb-2" style={{ color: "var(--hunter-green)" }}>Sobre o jogo</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
                  {details.description_raw.length > 1500 ? details.description_raw.slice(0, 1500) + "..." : details.description_raw}
                </p>
              </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(163,177,138,0.12)", border: "1px solid rgba(163,177,138,0.25)" }}>
              {details.platforms?.length > 0 && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Plataformas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {details.platforms.map((p) => (
                      <span key={p.platform.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(52,78,65,0.15)", color: "var(--pine-teal)" }}>
                        {p.platform.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {details.developers?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Desenvolvedor</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--pine-teal)" }}>{details.developers.map(d => d.name).join(", ")}</span>
                </div>
              )}
              {details.publishers?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Publisher</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--pine-teal)" }}>{details.publishers.map(p => p.name).join(", ")}</span>
                </div>
              )}
              {details.esrb_rating && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Classificação</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--pine-teal)" }}>{details.esrb_rating.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trailers */}
        {movies.length > 0 && (
          <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold mb-5" style={{ color: "var(--hunter-green)" }}>Trailers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {movies.map((movie) => (
                <div key={movie.id} className="rounded-2xl overflow-hidden shadow-md" style={{ backgroundColor: "var(--hunter-green)" }}>
                  <div className="relative w-full aspect-video">
                    <video
                      src={movie.data.max || movie.data["480"] || ""}
                      poster={movie.preview}
                      controls
                      preload="none"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--dust-grey)" }}>{movie.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Screenshots */}
        {screenshots.length > 0 && (
          <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl font-bold mb-5" style={{ color: "var(--hunter-green)" }}>Screenshots</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {screenshots.map((ss) => (
                <button key={ss.id} type="button" onClick={() => setLightboxImage(ss.image)}
                  className="flex-shrink-0 rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
                  <img src={ss.image} alt={`Screenshot`}
                    className="h-40 md:h-52 w-auto object-cover" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 cursor-pointer"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Imagem ampliada" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-fade-in-scale" />
        </div>
      )}

      {/* Add to Library Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(52,78,65,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-scale" style={{ backgroundColor: "#fff" }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--pine-teal)" }}>Adicionar ao inventário</h2>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>{details.name}</p>

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              {submitError && (
                <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.2)" }}>
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "var(--pine-teal)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  {submitSuccess}
                </div>
              )}

              <div>
                <label htmlFor="modal-game-collection" className="block text-sm font-semibold mb-2" style={{ color: "var(--hunter-green)" }}>Coleção (opcional)</label>
                <select id="modal-game-collection" value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none"
                  style={{ border: "1.5px solid var(--border)", color: "var(--pine-teal)", backgroundColor: "#fff" }}>
                  <option value="">Salvar sem coleção</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(163,177,138,0.15)", border: "1px solid rgba(163,177,138,0.4)" }}>
                <label htmlFor="modal-game-status" className="block text-sm font-semibold mb-2" style={{ color: "var(--hunter-green)" }}>Status do jogo</label>
                <select id="modal-game-status" value={gameStatus} onChange={(e) => setGameStatus(e.target.value as GameStatus)}
                  className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none"
                  style={{ border: "1.5px solid var(--border)", color: "var(--pine-teal)", backgroundColor: "#fff" }}>
                  <option value="unplayed">Não jogado</option>
                  <option value="playing">Jogando</option>
                  <option value="completed">Finalizado</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                  style={{ color: "var(--text-muted)" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "var(--pine-teal)", color: "var(--dust-grey)" }}>
                  {isSubmitting ? "Salvando..." : "Salvar no inventário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
