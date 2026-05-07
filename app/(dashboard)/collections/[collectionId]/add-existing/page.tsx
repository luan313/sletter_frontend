"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface CatalogMediaItem {
  id: number;
  title: string;
  poster_path?: string | null;
  media_type: "movie" | "tv";
}

interface CatalogGameItem {
  id: number;
  title: string;
  background_image?: string | null;
}

interface FullCatalogResponse {
  movies: CatalogMediaItem[];
  series: CatalogMediaItem[];
  games: CatalogGameItem[];
}

interface SelectableItem {
  key: string;
  kind: "media" | "game";
  id: number;
  title: string;
  mediaType?: "movie" | "tv";
  image?: string | null;
}

export default function AddExistingOnCollectionPage() {
  const params = useParams<{ collectionId: string }>();
  const router = useRouter();
  const collectionId = params.collectionId;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [items, setItems] = useState<SelectableItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<FullCatalogResponse>("/catalog/all");
        const mediaItems: SelectableItem[] = [...(data.movies ?? []), ...(data.series ?? [])].map((item) => ({
          key: `media-${item.media_type}-${item.id}`,
          kind: "media",
          id: item.id,
          mediaType: item.media_type,
          title: item.title,
          image: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
        }));
        const gameItems: SelectableItem[] = (data.games ?? []).map((item) => ({
          key: `game-${item.id}`,
          kind: "game",
          id: item.id,
          title: item.title,
          image: item.background_image || null,
        }));
        setItems([...mediaItems, ...gameItems]);
      } catch (err: any) {
        setError(err.message || "Nao foi possivel carregar o inventario.");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const selectedCount = useMemo(
    () => Object.values(selectedKeys).filter(Boolean).length,
    [selectedKeys]
  );

  const toggleItem = (key: string) => {
    setSelectedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    const selectedItems = items.filter((item) => selectedKeys[item.key]);
    if (selectedItems.length === 0) {
      setError("Selecione pelo menos uma obra para adicionar.");
      return;
    }

    const mediaPayload = selectedItems
      .filter((item) => item.kind === "media")
      .map((item) => ({
        id: String(item.id),
        collection_id: collectionId,
      }));

    const gamePayload = selectedItems
      .filter((item) => item.kind === "game")
      .map((item) => ({
        id: String(item.id),
        collection_id: collectionId,
      }));

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const requests: Promise<unknown>[] = [];
      if (mediaPayload.length > 0) {
        requests.push(
          apiFetch("/media/add_on_collection", {
            method: "POST",
            body: JSON.stringify(mediaPayload),
          })
        );
      }
      if (gamePayload.length > 0) {
        requests.push(
          apiFetch("/game/add_on_collection", {
            method: "POST",
            body: JSON.stringify(gamePayload),
          })
        );
      }

      await Promise.all(requests);
      setSuccessMessage("Obras adicionadas na coleção com sucesso.");
      setTimeout(() => router.push("/collections"), 900);
    } catch (err: any) {
      setError(err.message || "Nao foi possivel adicionar as obras na coleção.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: "var(--bg-primary)" }}>
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 shadow-lg"
        style={{ backgroundColor: "var(--pine-teal)", borderBottom: "1px solid rgba(163,177,138,0.2)" }}
      >
        <Link href={`/collections/${collectionId}/add`} className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
          ← Voltar
        </Link>
        <span className="text-sm font-semibold" style={{ color: "var(--dust-grey)" }}>
          {selectedCount} selecionadas
        </span>
      </nav>

      <div className="px-6 py-8 md:px-12 lg:px-20">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "var(--pine-teal)" }}>
            Adicionar obras existentes
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Selecione uma ou mais obras do seu inventário para adicionar nesta coleção.
          </p>
        </div>

        {error && (
          <div className="text-sm p-3 rounded-lg mb-4" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-sm p-3 rounded-lg mb-4" style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "var(--pine-teal)" }}>
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--dry-sage)", borderTopColor: "var(--pine-teal)" }} />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Seu inventário está vazio.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleItem(item.key)}
                  className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                  style={{
                    backgroundColor: "var(--hunter-green)",
                    outline: selectedKeys[item.key] ? "3px solid var(--fern)" : "none",
                  }}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs px-3 text-center" style={{ color: "var(--dust-grey)" }}>
                      Sem imagem
                    </div>
                  )}
                  <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(52,78,65,0.82)", color: "var(--dust-grey)" }}>
                    {item.kind === "game" ? "Jogo" : item.mediaType === "tv" ? "Serie" : "Filme"}
                  </div>
                  <div className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: selectedKeys[item.key] ? "var(--fern)" : "rgba(255,255,255,0.75)", color: selectedKeys[item.key] ? "var(--dust-grey)" : "var(--pine-teal)" }}>
                    {selectedKeys[item.key] ? "✓" : "+"}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(to top, rgba(52,78,65,0.95), rgba(52,78,65,0.15))" }}>
                    <span className="font-bold text-xs leading-tight block" style={{ color: "var(--dust-grey)" }}>
                      {item.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || selectedCount === 0}
                className="px-5 py-3 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: "var(--pine-teal)", color: "var(--dust-grey)" }}
              >
                {submitting ? "Adicionando..." : "Adicionar selecionadas"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
