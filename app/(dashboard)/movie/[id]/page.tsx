"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface TmdbDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  original_language: string;
}

interface TmdbImage {
  file_path: string;
  width: number;
  height: number;
}

interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

interface ApiResponse {
  details: TmdbDetails;
  images: { backdrops: TmdbImage[]; posters: TmdbImage[] };
  videos: TmdbVideo[];
}

interface Collection {
  id: string;
  name: string;
}

type MediaWatchStatus = "watched" | "not_watched" | "in_progress";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Library status
  const [inLibrary, setInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [watchStatus, setWatchStatus] = useState<MediaWatchStatus>("not_watched");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/tmdb/movie/${id}`);
      if (!res.ok) throw new Error("Não foi possível carregar os detalhes do filme.");
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
      await apiFetch(`/media/${id}`);
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
      await apiFetch("/media/add_on_lib", {
        method: "POST",
        body: JSON.stringify({
          tmdb_id: String(id),
          media_type: "movie",
          watched: watchStatus,
          collection_id: selectedCollectionId || null,
        }),
      });
      setSubmitSuccess("Filme adicionado ao inventário!");
      setInLibrary(true);
      setTimeout(() => setShowAddModal(false), 1200);
    } catch (err: any) {
      setSubmitError(err.message || "Erro ao adicionar filme.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRuntime = (min: number) => {
    if (!min) return "";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}min`;
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

  const { details, images, videos } = data;
  const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;
  const backdropUrl = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null;
  const year = details.release_date ? details.release_date.slice(0, 4) : "";
  const rating = details.vote_average ? details.vote_average.toFixed(1) : null;

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

      {/* Hero Backdrop */}
      <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
        {backdropUrl ? (
          <img src={backdropUrl} alt={details.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: "var(--hunter-green)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 35%, rgba(218,215,205,0.8) 55%, transparent 100%)" }} />
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 lg:px-20 -mt-48 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mb-12">
          {/* Poster */}
          <div className="animate-fade-in-scale">
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "3px solid rgba(218,215,205,0.3)" }}>
              {posterUrl ? (
                <img src={posterUrl} alt={details.title} className="w-full aspect-[2/3] object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] flex items-center justify-center" style={{ backgroundColor: "var(--hunter-green)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--dust-grey)" }}>Sem imagem</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
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
            </div>
          </div>

          {/* Info */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--dry-sage)", color: "var(--pine-teal)" }}>Filme</span>
              {year && <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{year}</span>}
              {details.runtime > 0 && <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{formatRuntime(details.runtime)}</span>}
              {rating && (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(88,129,87,0.2)", color: "var(--hunter-green)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  {rating}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "var(--pine-teal)" }}>{details.title}</h1>

            {details.tagline && (
              <p className="text-sm italic mb-4" style={{ color: "var(--text-muted)" }}>"{details.tagline}"</p>
            )}

            {details.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {details.genres.map((g) => (
                  <span key={g.id} className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(163,177,138,0.25)", color: "var(--hunter-green)", border: "1px solid rgba(163,177,138,0.4)" }}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {details.overview && (
              <div className="mb-6">
                <h2 className="text-sm font-bold mb-2" style={{ color: "var(--hunter-green)" }}>Sinopse</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{details.overview}</p>
              </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(163,177,138,0.12)", border: "1px solid rgba(163,177,138,0.25)" }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Lançamento</span>
                <span className="text-sm font-semibold" style={{ color: "var(--pine-teal)" }}>{details.release_date || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Idioma</span>
                <span className="text-sm font-semibold uppercase" style={{ color: "var(--pine-teal)" }}>{details.original_language || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Votos</span>
                <span className="text-sm font-semibold" style={{ color: "var(--pine-teal)" }}>{details.vote_count?.toLocaleString() || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Videos */}
        {videos.length > 0 && (
          <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold mb-5" style={{ color: "var(--hunter-green)" }}>Vídeos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="rounded-2xl overflow-hidden shadow-md" style={{ backgroundColor: "var(--hunter-green)" }}>
                  <div className="relative w-full aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.key}`}
                      title={video.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--dust-grey)" }}>{video.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--dry-sage)" }}>{video.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Images / Backdrops */}
        {images.backdrops.length > 0 && (
          <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl font-bold mb-5" style={{ color: "var(--hunter-green)" }}>Imagens</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {images.backdrops.map((img, i) => (
                <button key={i} type="button" onClick={() => setLightboxImage(`https://image.tmdb.org/t/p/w1280${img.file_path}`)}
                  className="flex-shrink-0 rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
                  <img src={`https://image.tmdb.org/t/p/w500${img.file_path}`} alt={`Cena ${i + 1}`}
                    className="h-40 md:h-52 w-auto object-cover" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Posters */}
        {images.posters.length > 1 && (
          <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-xl font-bold mb-5" style={{ color: "var(--hunter-green)" }}>Pôsteres</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {images.posters.map((img, i) => (
                <button key={i} type="button" onClick={() => setLightboxImage(`https://image.tmdb.org/t/p/w780${img.file_path}`)}
                  className="flex-shrink-0 rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
                  <img src={`https://image.tmdb.org/t/p/w300${img.file_path}`} alt={`Pôster ${i + 1}`}
                    className="h-52 md:h-64 w-auto object-cover" />
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
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>{details.title}</p>

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
                <label htmlFor="modal-collection" className="block text-sm font-semibold mb-2" style={{ color: "var(--hunter-green)" }}>Coleção (opcional)</label>
                <select id="modal-collection" value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none"
                  style={{ border: "1.5px solid var(--border)", color: "var(--pine-teal)", backgroundColor: "#fff" }}>
                  <option value="">Salvar sem coleção</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(163,177,138,0.15)", border: "1px solid rgba(163,177,138,0.4)" }}>
                <label htmlFor="modal-watch-status" className="block text-sm font-semibold mb-2" style={{ color: "var(--hunter-green)" }}>Status de consumo</label>
                <select id="modal-watch-status" value={watchStatus} onChange={(e) => setWatchStatus(e.target.value as MediaWatchStatus)}
                  className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none"
                  style={{ border: "1.5px solid var(--border)", color: "var(--pine-teal)", backgroundColor: "#fff" }}>
                  <option value="not_watched">Não assistido</option>
                  <option value="in_progress">Em progresso</option>
                  <option value="watched">Assistido</option>
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
