"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/utils/api";

interface Collection {
  id: string;
  name: string;
}

export default function CollectionAddChoicePage() {
  const params = useParams<{ collectionId: string }>();
  const router = useRouter();
  const collectionId = params.collectionId;
  const [collectionName, setCollectionName] = useState("Coleção");

  const discoverHref = useMemo(() => `/discover?collectionId=${encodeURIComponent(collectionId)}`, [collectionId]);
  const addExistingHref = useMemo(() => `/collections/${collectionId}/add-existing`, [collectionId]);

  useEffect(() => {
    const fetchCollectionName = async () => {
      try {
        const data = await apiFetch<{ collections: Collection[] }>("/collections/");
        const currentCollection = (data.collections ?? []).find((collection) => collection.id === collectionId);
        if (currentCollection?.name) {
          setCollectionName(currentCollection.name);
        }
      } catch {
        setCollectionName("Coleção");
      }
    };

    fetchCollectionName();
  }, [collectionId]);

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: "var(--bg-primary)" }}>
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 shadow-lg"
        style={{ backgroundColor: "var(--pine-teal)", borderBottom: "1px solid rgba(163,177,138,0.2)" }}
      >
        <Link href="/collections" className="text-sm font-medium transition-colors duration-200" style={{ color: "var(--dry-sage)" }}>
          ← Voltar para coleções
        </Link>
      </nav>

      <div className="px-6 py-8 md:px-12 lg:px-20">
        <section className="max-w-3xl rounded-2xl p-8 shadow-md animate-fade-in-scale" style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "var(--pine-teal)" }}>
            Adicionar obra
          </h1>
          <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>
            Escolha como deseja adicionar itens na coleção <strong>{collectionName}</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => router.push(addExistingHref)}
              className="rounded-2xl p-6 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
              style={{ border: "1.5px solid rgba(88,129,87,0.35)", backgroundColor: "rgba(88,129,87,0.08)" }}
            >
              <p className="text-lg font-bold mb-1" style={{ color: "var(--hunter-green)" }}>
                Adicionar obra existente
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Selecione múltiplas obras que já estão no seu inventário.
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push(discoverHref)}
              className="rounded-2xl p-6 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
              style={{ border: "1.5px solid rgba(52,78,65,0.35)", backgroundColor: "rgba(52,78,65,0.08)" }}
            >
              <p className="text-lg font-bold mb-1" style={{ color: "var(--pine-teal)" }}>
                Adicionar nova obra
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Redireciona para Discover para buscar e cadastrar uma obra nova.
              </p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
