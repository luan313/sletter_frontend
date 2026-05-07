"use client";

import Link from "next/link";
import { Suspense, useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface Collection {
  id: string;
  name: string;
}

type GameStatus = "unplayed" | "playing" | "completed";
type MediaType = "movie" | "tv";
type MediaWatchStatus = "watched" | "not_watched" | "in_progress";

export default function InventoryAddPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{ borderColor: "var(--dry-sage)", borderTopColor: "var(--pine-teal)" }} />
      </main>
    }>
      <InventoryAddContent />
    </Suspense>
  );
}

function InventoryAddContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const kind = searchParams.get("kind");
  const itemId = searchParams.get("id");
  const title = searchParams.get("title") || "Sem titulo";
  const image = searchParams.get("image") || "";
  const mediaTypeFromQuery = searchParams.get("mediaType");
  const collectionIdFromQuery = searchParams.get("collectionId") || "";

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  const [selectedCollectionId, setSelectedCollectionId] = useState(collectionIdFromQuery);
  const [mediaWatchStatus, setMediaWatchStatus] = useState<MediaWatchStatus>("not_watched");
  const [gameStatus, setGameStatus] = useState<GameStatus>("unplayed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const mediaType = useMemo<MediaType>(() => {
    return mediaTypeFromQuery === "tv" ? "tv" : "movie";
  }, [mediaTypeFromQuery]);

  const invalidContext = !itemId || (kind !== "media" && kind !== "game");

  const fetchCollections = useCallback(async () => {
    try {
      setLoadingCollections(true);
      setCollectionError(null);
      const data = await apiFetch<{ collections: Collection[] }>("/collections/");
      setCollections(data.collections ?? []);
    } catch (err: any) {
      setCollectionError(err.message || "Nao foi possivel carregar as colecoes.");
    } finally {
      setLoadingCollections(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemId || (kind !== "media" && kind !== "game")) {
      setSubmitError("Dados da obra invalidos. Volte para a tela de discover.");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    const collectionValue = selectedCollectionId || null;

    try {
      if (kind === "media") {
        await apiFetch("/media/add_on_lib", {
          method: "POST",
          body: JSON.stringify({
            tmdb_id: String(itemId),
            media_type: mediaType,
            watched: mediaWatchStatus,
            collection_id: collectionValue,
          }),
        });
      } else {
        await apiFetch("/game/add_on_lib", {
          method: "POST",
          body: JSON.stringify({
            rawg_id: Number(itemId),
            status: gameStatus,
            collection_id: collectionValue,
          }),
        });
      }

      setSubmitSuccess("Obra adicionada ao inventario com sucesso.");
      setTimeout(() => {
        router.push("/home");
      }, 1100);
    } catch (err: any) {
      setSubmitError(err.message || "Nao foi possivel adicionar a obra.");
    } finally {
      setIsSubmitting(false);
    }
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
        <Link href="/discover" className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
          ← Voltar para discover
        </Link>
      </nav>

      <div className="px-6 py-8 md:px-12 lg:px-20">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: "var(--pine-teal)" }}>
            Adicionar ao inventario
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Revise os dados da obra e escolha as opcoes para salvar.
          </p>
        </div>

        {invalidContext ? (
          <section className="max-w-3xl rounded-2xl p-6 animate-fade-in-scale shadow-md" style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--hunter-green)" }}>
              Dados invalidos
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Nao foi possivel identificar a obra selecionada.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: "var(--fern)", color: "var(--dust-grey)" }}
            >
              Voltar para discover
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8 animate-slide-up">
            <section className="rounded-2xl shadow-md overflow-hidden" style={{ backgroundColor: "var(--hunter-green)" }}>
              {image ? (
                <img src={image} alt={title} className="w-full aspect-[2/3] object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] flex items-center justify-center" style={{ backgroundColor: "rgba(163,177,138,0.35)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--dust-grey)" }}>
                    Sem imagem
                  </span>
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-base leading-tight mb-2" style={{ color: "var(--dust-grey)" }}>
                  {title}
                </h2>
                <span
                  className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--dry-sage)", color: "var(--pine-teal)" }}
                >
                  {kind === "media" ? (mediaType === "movie" ? "Filme" : "Serie") : "Jogo"}
                </span>
              </div>
            </section>

            <section className="rounded-2xl p-6 md:p-8 shadow-md animate-fade-in-scale" style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}>
              <form onSubmit={handleSubmit} className="space-y-5">
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
                  <label htmlFor="collection" className="block text-sm font-semibold mb-2" style={{ color: "var(--hunter-green)" }}>
                    Colecao (opcional)
                  </label>
                  <select
                    id="collection"
                    value={selectedCollectionId}
                    onChange={(e) => setSelectedCollectionId(e.target.value)}
                    disabled={loadingCollections}
                    className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none"
                    style={{ border: "1.5px solid var(--border)", color: "var(--pine-teal)", backgroundColor: "#fff" }}
                  >
                    <option value="">Salvar sem colecao</option>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                  {collectionError && (
                    <p className="mt-2 text-xs" style={{ color: "#b91c1c" }}>
                      {collectionError}
                    </p>
                  )}
                </div>

                {kind === "media" ? (
                  <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(163,177,138,0.15)", border: "1px solid rgba(163,177,138,0.4)" }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: "var(--hunter-green)" }}>
                      Configuracoes de midia
                    </p>
                    <label htmlFor="media-watched-status" className="block text-sm font-semibold mb-2" style={{ color: "var(--hunter-green)" }}>
                      Status de consumo
                    </label>
                    <select
                      id="media-watched-status"
                      value={mediaWatchStatus}
                      onChange={(e) => setMediaWatchStatus(e.target.value as MediaWatchStatus)}
                      className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none"
                      style={{ border: "1.5px solid var(--border)", color: "var(--pine-teal)", backgroundColor: "#fff" }}
                    >
                      <option value="not_watched">Nao assistido</option>
                      <option value="in_progress">Em progresso</option>
                      <option value="watched">Assistido</option>
                    </select>
                  </div>
                ) : (
                  <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(163,177,138,0.15)", border: "1px solid rgba(163,177,138,0.4)" }}>
                    <label htmlFor="status" className="block text-sm font-semibold mb-2" style={{ color: "var(--hunter-green)" }}>
                      Status do jogo
                    </label>
                    <select
                      id="status"
                      value={gameStatus}
                      onChange={(e) => setGameStatus(e.target.value as GameStatus)}
                      className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none"
                      style={{ border: "1.5px solid var(--border)", color: "var(--pine-teal)", backgroundColor: "#fff" }}
                    >
                      <option value="unplayed">Nao jogado</option>
                      <option value="playing">Jogando</option>
                      <option value="completed">Finalizado</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-3 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: "var(--pine-teal)", color: "var(--dust-grey)" }}
                  >
                    {isSubmitting ? "Salvando..." : "Salvar no inventario"}
                  </button>
                  <Link
                    href="/discover"
                    className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
