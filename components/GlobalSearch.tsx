"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface GlobalSearchProps {
  searchTypes: ("media" | "games" | "collections")[];
}

interface SearchResultItem {
  id?: number | string;
  tmdb_id?: number;
  rawg_id?: number;
  title?: string;
  name?: string;
  media_type?: "movie" | "tv";
  poster_path?: string;
  background_image?: string;
}

interface SearchResults {
  media?: SearchResultItem[];
  games?: SearchResultItem[];
  collections?: SearchResultItem[];
}

export default function GlobalSearch({ searchTypes }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({});
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("query", debouncedQuery);
        searchTypes.forEach(type => queryParams.append("type", type));

        const data = await apiFetch<any>(`/search/?${queryParams.toString()}`);
        if (data.status === "sucesso" && data.results) {
          setResults(data.results);
        } else {
          setResults({});
        }
      } catch (error) {
        console.error("Failed to search:", error);
        setResults({});
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, searchTypes]);

  const handleItemClick = (item: SearchResultItem, type: string) => {
    setIsOpen(false);
    setQuery("");
    
    if (type === "media") {
      if (item.media_type === "movie") router.push(`/movie/${item.tmdb_id}`);
      else if (item.media_type === "tv") router.push(`/tv/${item.tmdb_id}`);
    } else if (type === "games") {
      router.push(`/game/${item.rawg_id}`);
    } else if (type === "collections") {
      router.push(`/collections/${item.id}`);
    }
  };

  const renderItem = (item: SearchResultItem, type: string) => {
    const title = item.title || item.name || "Sem titulo";
    let imageSrc = null;
    if (item.poster_path) imageSrc = `https://image.tmdb.org/t/p/w92${item.poster_path}`;
    else if (item.background_image) imageSrc = item.background_image;

    return (
      <div 
        key={`${type}-${item.id || item.tmdb_id || item.rawg_id}`} 
        className="flex items-center gap-3 p-2 hover:bg-black/5 cursor-pointer rounded-lg transition-colors"
        onClick={() => handleItemClick(item, type)}
      >
        <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative" style={{ backgroundColor: 'rgba(163,177,138,0.2)' }}>
          {imageSrc ? (
            <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: 'var(--pine-teal)' }}>
              SF
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--hunter-green)' }}>{title}</p>
          <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
            {type === 'media' ? (item.media_type === 'movie' ? 'Filme' : 'Série') : type === 'games' ? 'Jogo' : 'Coleção'}
          </p>
        </div>
      </div>
    );
  };

  const hasResults = (results.media && results.media.length > 0) || 
                     (results.games && results.games.length > 0) || 
                     (results.collections && results.collections.length > 0);

  return (
    <div className="relative flex-1 max-w-md mx-8 hidden sm:block" ref={containerRef}>
      <input 
        type="search" 
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Pesquisar..."
        className="w-full rounded-xl px-5 py-2.5 text-sm transition-all duration-300 focus:outline-none focus:ring-2"
        style={{ backgroundColor: 'rgba(218,215,205,0.12)', border: '1px solid rgba(163,177,138,0.3)', color: 'var(--dust-grey)' }}
        onFocusCapture={(e) => { e.target.style.backgroundColor = 'rgba(218,215,205,0.2)'; e.target.style.borderColor = 'var(--dry-sage)'; }}
        onBlurCapture={(e) => { e.target.style.backgroundColor = 'rgba(218,215,205,0.12)'; e.target.style.borderColor = 'rgba(163,177,138,0.3)'; }}
      />
      
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-96" style={{ backgroundColor: '#fff', border: '1px solid rgba(163,177,138,0.3)' }}>
          {loading ? (
            <div className="p-4 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Buscando...
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Nenhum resultado encontrado.
            </div>
          ) : (
            <div className="overflow-y-auto p-2">
              {results.collections && results.collections.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-bold px-2 py-1 uppercase tracking-wider" style={{ color: 'var(--pine-teal)' }}>Coleções</h3>
                  {results.collections.map(item => renderItem(item, 'collections'))}
                </div>
              )}
              {results.media && results.media.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-bold px-2 py-1 uppercase tracking-wider" style={{ color: 'var(--pine-teal)' }}>Filmes e Séries</h3>
                  {results.media.map(item => renderItem(item, 'media'))}
                </div>
              )}
              {results.games && results.games.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-bold px-2 py-1 uppercase tracking-wider" style={{ color: 'var(--pine-teal)' }}>Jogos</h3>
                  {results.games.map(item => renderItem(item, 'games'))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
