"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface LibraryItemCardProps {
  apiId: number; // tmdb_id or rawg_id
  type: "movie" | "tv" | "game";
  title: string;
  image: string | null;
  status: any; // "watched" | "not_watched" | "in_progress" | boolean for media, or "unplayed" | "playing" | "completed" for games
  onRefresh: () => void;
  index?: number;
}

export default function LibraryItemCard({ apiId, type, title, image, status, onRefresh, index = 0 }: LibraryItemCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse status for display and state
  const isMedia = type === "movie" || type === "tv";
  const initialMediaStatus = status === true || status === "watched" ? "watched" : status === "in_progress" ? "in_progress" : "not_watched";
  const initialGameStatus = status || "unplayed";
  
  const [newStatus, setNewStatus] = useState(isMedia ? initialMediaStatus : initialGameStatus);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const getStatusLabel = () => {
    if (isMedia) {
      if (status === true || status === "watched") return "Assistido";
      if (status === "in_progress") return "Em progresso";
      return "Não assistido";
    } else {
      if (status === "completed") return "Finalizado";
      if (status === "playing") return "Jogando";
      return "Não jogado";
    }
  };

  const handleCardClick = () => {
    if (type === "movie") router.push(`/movie/${apiId}`);
    else if (type === "tv") router.push(`/tv/${apiId}`);
    else if (type === "game") router.push(`/game/${apiId}`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const endpoint = isMedia ? `/media/${apiId}` : `/game/${apiId}`;
      await apiFetch(endpoint, { method: "DELETE" });
      setShowDeleteModal(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Erro ao deletar o item.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsEditing(true);
      const endpoint = isMedia ? `/media/${apiId}` : `/game/${apiId}`;
      const body = isMedia ? { watched: newStatus } : { status: newStatus };
      
      await apiFetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      setShowEditModal(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Erro ao atualizar o status.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className="aspect-[2/3] w-full rounded-2xl shadow-md cursor-pointer group overflow-hidden relative transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-scale"
        style={{ backgroundColor: "var(--hunter-green)", animationDelay: `${index * 0.03}s` }}
      >
        {image && <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 z-20 text-[10px] px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(52,78,65,0.82)", color: "var(--dust-grey)", border: "1px solid rgba(163,177,138,0.55)" }}>
          {getStatusLabel()}
        </div>

        {/* Three dots menu */}
        <div className="absolute top-2 left-2 z-30" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-md opacity-0 group-hover:opacity-100 sm:opacity-100"
            style={{ backgroundColor: "rgba(52,78,65,0.7)", color: "var(--dust-grey)" }}
            aria-label="Ações da obra"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          
          {showMenu && (
            <div 
              className="absolute left-0 mt-2 min-w-[160px] rounded-xl shadow-lg py-1 z-40 animate-fade-in"
              style={{ backgroundColor: "#fff", border: "1px solid rgba(163,177,138,0.4)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                type="button" 
                className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-black/5" 
                style={{ color: "var(--pine-teal)" }}
                onClick={() => { setShowMenu(false); setShowEditModal(true); setNewStatus(isMedia ? initialMediaStatus : initialGameStatus); }}
              >
                Alterar status
              </button>
              <button 
                type="button" 
                className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-black/5" 
                style={{ color: "#b91c1c" }}
                onClick={() => { setShowMenu(false); setShowDeleteModal(true); }}
              >
                Deletar
              </button>
            </div>
          )}
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(52,78,65,0.95) 35%, rgba(52,78,65,0.35) 65%, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
          <span className="font-bold text-xs leading-tight block" style={{ color: "var(--dust-grey)" }}>
            {title}
          </span>
        </div>
      </article>

      {/* Edit Status Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(52,78,65,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in-scale" style={{ backgroundColor: '#fff' }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--pine-teal)' }}>Alterar Status</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Escolha o novo status para "{title}".</p>
            <form onSubmit={handleEdit} className="space-y-4">
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none cursor-pointer"
                style={{ border: '1.5px solid var(--border)', color: 'var(--pine-teal)' }}
              >
                {isMedia ? (
                  <>
                    <option value="watched">Assistido</option>
                    <option value="in_progress">Em progresso</option>
                    <option value="not_watched">Não assistido</option>
                  </>
                ) : (
                  <>
                    <option value="completed">Finalizado</option>
                    <option value="playing">Jogando</option>
                    <option value="unplayed">Não jogado</option>
                  </>
                )}
              </select>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isEditing}
                  className="px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: 'var(--pine-teal)', color: 'var(--dust-grey)' }}>
                  {isEditing ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(52,78,65,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in-scale" style={{ backgroundColor: '#fff' }}>
            <h2 className="text-xl font-bold mb-2 text-red-600">Deletar Obra</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Tem certeza que deseja remover "{title}" da sua biblioteca? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{ color: 'var(--text-muted)' }}>
                Cancelar
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 disabled:opacity-50 cursor-pointer bg-red-600 text-white">
                {isDeleting ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
